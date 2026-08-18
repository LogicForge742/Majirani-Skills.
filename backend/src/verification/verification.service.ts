import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProfileCompletionService } from './profile-completion.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import {
  ReviewVerificationDto,
  ReviewAction,
} from './dto/review-verification.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private profileCompletion: ProfileCompletionService,
  ) {}

  // ─── Personal Info ────────────────────────────────────────

  async updatePersonalInfo(artisanId: string, dto: UpdatePersonalInfoDto) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
      include: { skillCategory: true },
    });
    if (!artisan) throw new NotFoundException('Artisan profile not found.');

    // If skill category changed, update the denormalised skill field too
    let skillName = artisan.skill;
    if (
      dto.skillCategoryId &&
      dto.skillCategoryId !== artisan.skillCategoryId
    ) {
      const category = await this.prisma.skillCategory.findUnique({
        where: { id: dto.skillCategoryId },
      });
      if (!category) throw new NotFoundException('Skill category not found.');
      skillName = category.name;
    }

    const updated = await this.prisma.artisan.update({
      where: { id: artisanId },
      data: {
        ...dto,
        skill: skillName,
        location:
          dto.town && dto.county
            ? `${dto.town}, ${dto.county}`
            : artisan.location,
      },
      include: { skillCategory: true },
    });

    await this.profileCompletion.recompute(artisanId);
    return updated;
  }

  // ─── Submit Verification ──────────────────────────────────

  async submitVerification(
    artisanId: string,
    userId: string,
    dto: SubmitVerificationDto,
    files: {
      idFrontImage: Express.Multer.File[];
      idBackImage: Express.Multer.File[];
      selfieImage: Express.Multer.File[];
    },
  ) {
    // Validate all three images provided
    if (
      !files.idFrontImage?.[0] ||
      !files.idBackImage?.[0] ||
      !files.selfieImage?.[0]
    ) {
      throw new BadRequestException(
        'All three images are required: idFrontImage, idBackImage, selfieImage.',
      );
    }

    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
    });
    if (!artisan) throw new NotFoundException('Artisan profile not found.');

    // Check for existing verification — allow resubmission only if REJECTED
    const existing = await this.prisma.artisanVerification.findUnique({
      where: { artisanId },
    });

    if (
      existing &&
      existing.verificationStatus === VerificationStatus.PENDING
    ) {
      throw new ConflictException(
        'You already have a pending verification. Please wait for the admin to review it.',
      );
    }

    if (
      existing &&
      existing.verificationStatus === VerificationStatus.VERIFIED
    ) {
      throw new ConflictException('Your identity is already verified.');
    }

    // Upload all three images to Cloudinary in parallel
    const folder = `majirani/verifications/${artisanId}`;
    const [idFront, idBack, selfie] = await Promise.all([
      this.storage.uploadBuffer(
        files.idFrontImage[0].buffer,
        folder,
        'id-front',
      ),
      this.storage.uploadBuffer(files.idBackImage[0].buffer, folder, 'id-back'),
      this.storage.uploadBuffer(files.selfieImage[0].buffer, folder, 'selfie'),
    ]);

    const verificationScore =
      this.profileCompletion.computeVerificationScore(artisan);
    const isResubmission =
      existing?.verificationStatus === VerificationStatus.REJECTED;

    // Upsert verification record
    const verification = await this.prisma.artisanVerification.upsert({
      where: { artisanId },
      create: {
        artisanId,
        nationalIdNumber: dto.nationalIdNumber,
        idFrontImage: idFront.url,
        idBackImage: idBack.url,
        selfieImage: selfie.url,
        verificationStatus: VerificationStatus.PENDING,
        verificationScore,
      },
      update: {
        nationalIdNumber: dto.nationalIdNumber,
        idFrontImage: idFront.url,
        idBackImage: idBack.url,
        selfieImage: selfie.url,
        verificationStatus: VerificationStatus.PENDING,
        verificationScore,
        adminNote: null,
        verifiedAt: null,
      },
    });

    // Append audit trail
    await this.prisma.verificationHistory.create({
      data: {
        verificationId: verification.id,
        action: isResubmission ? 'RESUBMITTED' : 'SUBMITTED',
        performedById: userId,
      },
    });

    await this.profileCompletion.recompute(artisanId);

    return {
      message:
        'Verification submitted successfully. You will be notified once reviewed.',
      verificationId: verification.id,
      status: verification.verificationStatus,
    };
  }

  // ─── Get Own Status ───────────────────────────────────────

  async getMyVerificationStatus(artisanId: string) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
      select: {
        id: true,
        skill: true,
        county: true,
        town: true,
        bio: true,
        phone: true,
        profilePhoto: true,
        verificationScore: true,
        profileCompletion: true,
        verified: true,
        skillCategory: { select: { id: true, name: true, slug: true } },
        rankCache: {
          select: {
            cachedRank: true,
            cachedPercentile: true,
            resolvedBucket: true,
          },
        },
        verification: {
          select: {
            id: true,
            verificationStatus: true,
            verificationScore: true,
            adminNote: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!artisan) throw new NotFoundException('Artisan profile not found.');
    return artisan;
  }

  // ─── Admin: List All Verifications ────────────────────────

  async adminListVerifications(status?: VerificationStatus) {
    return this.prisma.artisanVerification.findMany({
      where: status ? { verificationStatus: status } : undefined,
      include: {
        artisan: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            skillCategory: { select: { name: true, slug: true } },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Admin: Review (Approve / Reject / Suspend) ───────────

  async adminReviewVerification(
    verificationId: string,
    adminUserId: string,
    dto: ReviewVerificationDto,
  ) {
    const verification = await this.prisma.artisanVerification.findUnique({
      where: { id: verificationId },
      include: { artisan: true },
    });

    if (!verification)
      throw new NotFoundException('Verification record not found.');

    if (
      verification.verificationStatus === VerificationStatus.VERIFIED &&
      dto.action !== ReviewAction.SUSPEND
    ) {
      throw new ConflictException('This verification is already approved.');
    }

    const statusMap: Record<ReviewAction, VerificationStatus> = {
      [ReviewAction.APPROVE]: VerificationStatus.VERIFIED,
      [ReviewAction.REJECT]: VerificationStatus.REJECTED,
      [ReviewAction.SUSPEND]: VerificationStatus.SUSPENDED,
    };

    const newStatus = statusMap[dto.action];
    const isApproved = newStatus === VerificationStatus.VERIFIED;

    // Update verification record
    const updated = await this.prisma.artisanVerification.update({
      where: { id: verificationId },
      data: {
        verificationStatus: newStatus,
        adminNote: dto.adminNote ?? null,
        verifiedAt: isApproved ? new Date() : verification.verifiedAt,
        verifiedById: adminUserId,
      },
    });

    // Sync artisan.verified flag and verificationScore
    await this.prisma.artisan.update({
      where: { id: verification.artisanId },
      data: {
        verified: isApproved,
        verificationScore: isApproved ? verification.verificationScore : 0,
      },
    });

    // Append to audit trail
    await this.prisma.verificationHistory.create({
      data: {
        verificationId,
        action: dto.action, // APPROVED | REJECTED | SUSPENDED
        performedById: adminUserId,
        reason: dto.adminNote,
      },
    });

    // Recompute profile completion after status change
    await this.profileCompletion.recompute(verification.artisanId);

    return {
      message: `Verification ${dto.action.toLowerCase()}d successfully.`,
      status: newStatus,
    };
  }

  // ─── Admin: Get Verification Detail ──────────────────────

  async adminGetVerification(verificationId: string) {
    const verification = await this.prisma.artisanVerification.findUnique({
      where: { id: verificationId },
      include: {
        artisan: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
            skillCategory: true,
          },
        },
        history: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!verification)
      throw new NotFoundException('Verification record not found.');
    return verification;
  }

  // ─── Admin: Get Stats for Dashboard ──────────────────────

  async adminStats() {
    const [pending, verified, suspended, totalUsers, totalArtisans] =
      await Promise.all([
        this.prisma.artisanVerification.count({
          where: { verificationStatus: 'PENDING' },
        }),
        this.prisma.artisan.count({
          where: { verified: true },
        }),
        this.prisma.artisanVerification.count({
          where: { verificationStatus: 'SUSPENDED' },
        }),
        this.prisma.user.count(),
        this.prisma.artisan.count(),
      ]);

    return {
      pendingVerificationsCount: pending,
      verifiedArtisansCount: verified,
      suspendedAccountsCount: suspended,
      totalUsersCount: totalUsers,
      totalArtisansCount: totalArtisans,
    };
  }
}
