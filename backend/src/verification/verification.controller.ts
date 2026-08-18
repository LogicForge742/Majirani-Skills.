import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VerificationService } from './verification.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role, VerificationStatus } from '@prisma/client';

// Images are stored in memory and streamed directly to Cloudinary — no disk I/O.
const imageUpload = FileFieldsInterceptor(
  [
    { name: 'idFrontImage', maxCount: 1 },
    { name: 'idBackImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 },
  ],
  {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|webp|jpg)$/)) {
        cb(new Error('Only JPEG, PNG, and WebP images are accepted.'), false);
      } else {
        cb(null, true);
      }
    },
  },
);

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  // ─── Artisan: Update Personal Information (Step 1) ────────

  @Patch('artisans/me/personal-info')
  @UseGuards(RolesGuard)
  @Roles(Role.ARTISAN)
  updatePersonalInfo(
    @CurrentUser() user: any,
    @Body() dto: UpdatePersonalInfoDto,
  ) {
    const artisanId = user.artisan?.id;
    if (!artisanId) {
      return { message: 'Create an artisan profile first.' };
    }
    return this.verificationService.updatePersonalInfo(artisanId, dto);
  }

  // ─── Artisan: Submit Verification (Step 2) ────────────────

  @Post('verification/submit')
  @UseGuards(RolesGuard)
  @Roles(Role.ARTISAN)
  @UseInterceptors(imageUpload)
  submitVerification(
    @CurrentUser() user: any,
    @Body() dto: SubmitVerificationDto,
    @UploadedFiles()
    files: {
      idFrontImage: Express.Multer.File[];
      idBackImage: Express.Multer.File[];
      selfieImage: Express.Multer.File[];
    },
  ) {
    const artisanId = user.artisan?.id;
    if (!artisanId) {
      return { message: 'Create an artisan profile first.' };
    }
    return this.verificationService.submitVerification(
      artisanId,
      user.id,
      dto,
      files,
    );
  }

  // ─── Artisan: Get Own Verification Status ─────────────────

  @Get('verification/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ARTISAN)
  getMyStatus(@CurrentUser() user: any) {
    const artisanId = user.artisan?.id;
    if (!artisanId) {
      return { message: 'Create an artisan profile first.' };
    }
    return this.verificationService.getMyVerificationStatus(artisanId);
  }

  // ─── Admin: Get Stats for Dashboard ──────────────────────

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  adminStats() {
    return this.verificationService.adminStats();
  }

  // ─── Admin: List All Verifications ────────────────────────

  @Get('admin/verifications')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  adminList(@Query('status') status?: VerificationStatus) {
    return this.verificationService.adminListVerifications(status);
  }

  // ─── Admin: Get Single Verification Detail ────────────────

  @Get('admin/verifications/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  adminGet(@Param('id') id: string) {
    return this.verificationService.adminGetVerification(id);
  }

  // ─── Admin: Review (Approve / Reject / Suspend) ───────────

  @Patch('admin/verifications/:id/review')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  adminReview(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.verificationService.adminReviewVerification(id, user.id, dto);
  }
}
