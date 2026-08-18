import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ProfileCompletionService — dynamic engine, not hardcoded percentages.
 * Call recompute() after any artisan mutation to keep the stored value fresh.
 *
 * Weights:
 *   profilePhoto   20%
 *   VERIFIED       30%
 *   skillCategory  20%
 *   location       10%
 *   bio            10%
 *   ≥1 service     10%
 */
@Injectable()
export class ProfileCompletionService {
  constructor(private prisma: PrismaService) {}

  async recompute(artisanId: string): Promise<number> {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
      include: {
        verification: { select: { verificationStatus: true } },
        services: { where: { isActive: true }, select: { id: true } },
        portfolio: { select: { id: true } },
      },
    });

    if (!artisan) return 0;

    let score = 0;

    if (artisan.profilePhoto) score += 20;
    if (artisan.verification?.verificationStatus === 'VERIFIED') score += 30;
    if (artisan.skillCategoryId) score += 20;
    if (artisan.county || artisan.town) score += 10;
    if (artisan.bio) score += 10;
    if (artisan.portfolio.length > 0) score += 10;

    await this.prisma.artisan.update({
      where: { id: artisanId },
      data: { profileCompletion: score },
    });

    return score;
  }

  /**
   * Compute verification score based on granular signals.
   * ID = 40, Phone = 20, Selfie = 20, Location = 20
   */
  computeVerificationScore(artisan: {
    phone?: string | null;
    county?: string | null;
    town?: string | null;
  }): number {
    let score = 40; // ID always submitted when verification created
    if (artisan.phone) score += 20;
    score += 20; // Selfie always submitted when verification created
    if (artisan.county || artisan.town) score += 20;
    return Math.min(score, 100);
  }
}
