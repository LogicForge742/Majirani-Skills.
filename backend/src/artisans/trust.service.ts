import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrustService {
  constructor(private prisma: PrismaService) {}

  async calculateTrustScore(artisanId: string): Promise<{
    trustScore: number;
    profileCompletion: number;
    breakdown: { eventType: string; points: number; description: string }[];
  }> {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
      include: {
        verification: true,
        reviews: true,
        portfolio: true,
      },
    });

    if (!artisan) {
      throw new NotFoundException(`Artisan with ID ${artisanId} not found`);
    }

    // 1. Identity Verification (40%)
    let verificationPoints = 0;
    let verificationStatusDesc = 'No identity verification documents submitted';
    if (artisan.verification) {
      const status = artisan.verification.verificationStatus;
      if (status === 'VERIFIED') {
        verificationPoints = 40;
        verificationStatusDesc = 'Identity document verified (+40)';
      } else if (status === 'PENDING') {
        verificationPoints = 20;
        verificationStatusDesc = 'Identity document verification pending (+20)';
      } else {
        verificationStatusDesc = `Identity verification status is ${status} (+0)`;
      }
    }

    // 2. Profile Completeness (20%)
    // 5% credit per field: Profile Avatar, Bio, Location, and Phone
    let completenessPoints = 0;
    const completenessBreakdown: {
      key: string;
      has: boolean;
      points: number;
    }[] = [];

    const hasAvatar = !!artisan.profilePhoto;
    if (hasAvatar) completenessPoints += 5;
    completenessBreakdown.push({
      key: 'Avatar',
      has: hasAvatar,
      points: hasAvatar ? 5 : 0,
    });

    const hasBio = !!artisan.bio && artisan.bio.trim().length > 0;
    if (hasBio) completenessPoints += 5;
    completenessBreakdown.push({
      key: 'Bio',
      has: hasBio,
      points: hasBio ? 5 : 0,
    });

    const hasLocation = !!(artisan.county || artisan.town);
    if (hasLocation) completenessPoints += 5;
    completenessBreakdown.push({
      key: 'Location',
      has: hasLocation,
      points: hasLocation ? 5 : 0,
    });

    const hasPhone = !!artisan.phone && artisan.phone.trim().length > 0;
    if (hasPhone) completenessPoints += 5;
    completenessBreakdown.push({
      key: 'Phone',
      has: hasPhone,
      points: hasPhone ? 5 : 0,
    });

    const profileCompletionPercent = (completenessPoints / 20) * 100;

    // 3. Review Quality & Volume (30%)
    // Formula: averageRating * min(reviewCount / 10, 1) * 6
    const reviewCount = artisan.reviews.length;
    let avgRating = 0;
    if (reviewCount > 0) {
      const sum = artisan.reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = sum / reviewCount;
    }
    const volumeFactor = Math.min(reviewCount / 10, 1);
    const reviewPoints = Math.round(avgRating * volumeFactor * 6 * 10) / 10; // round to 1 decimal place

    // 4. Experience History (10%)
    // min(completedJobs, 10) * 1. For now, completedJobsCount is reviewCount (proxy for completed jobs)
    const completedJobsCount = reviewCount;
    const experiencePoints = Math.min(completedJobsCount, 10) * 1;

    const totalTrustScore = Math.min(
      Math.round(
        (verificationPoints +
          completenessPoints +
          reviewPoints +
          experiencePoints) *
          10,
      ) / 10,
      100,
    );

    // Build breakdown events
    const breakdown = [
      {
        eventType: 'ID_VERIFIED',
        points: verificationPoints,
        description: verificationStatusDesc,
      },
      {
        eventType: 'PROFILE_COMPLETED',
        points: completenessPoints,
        description: `Profile completion checklist: ${
          completenessBreakdown
            .filter((c) => c.has)
            .map((c) => c.key)
            .join(', ') || 'None'
        } (+${completenessPoints})`,
      },
      {
        eventType: 'REVIEWS_RECEIVED',
        points: Math.round(reviewPoints),
        description: `Customer reviews rating: ${avgRating.toFixed(1)} stars from ${reviewCount} review(s) (+${Math.round(reviewPoints)})`,
      },
      {
        eventType: 'EXPERIENCE_HISTORY',
        points: experiencePoints,
        description: `Experience history: completed ${completedJobsCount} job(s) (+${experiencePoints})`,
      },
    ];

    // Persist Trust Score to Artisan model
    await this.prisma.artisan.update({
      where: { id: artisanId },
      data: {
        verificationScore: Math.round(totalTrustScore),
        profileCompletion: Math.round(profileCompletionPercent),
      },
    });

    // Sync TrustEvent logs in database for transparency
    await this.prisma.trustEvent.deleteMany({ where: { artisanId } });
    await this.prisma.trustEvent.createMany({
      data: breakdown.map((item) => ({
        artisanId,
        eventType: item.eventType,
        points: item.points,
        description: item.description,
      })),
    });

    return {
      trustScore: totalTrustScore,
      profileCompletion: profileCompletionPercent,
      breakdown,
    };
  }

  async getTrustEvents(artisanId: string) {
    return this.prisma.trustEvent.findMany({
      where: { artisanId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recalculateRanks(): Promise<{ message: string; count: number }> {
    // 1. Fetch all artisans with their categories
    const artisans = await this.prisma.artisan.findMany({
      include: {
        reviews: true,
        verification: true,
      },
    });

    // Recalculate trust scores for everyone first so that we use fresh scores
    const calculatedScores = await Promise.all(
      artisans.map(async (artisan) => {
        const { trustScore } = await this.calculateTrustScore(artisan.id);
        return {
          id: artisan.id,
          score: trustScore,
          county: artisan.county || '',
          town: artisan.town || '',
          skillCategoryId: artisan.skillCategoryId || '',
          skill: artisan.skill || '',
        };
      }),
    );

    let rankCacheCount = 0;

    // We will partition calculations by Category + Location
    // Let's group calculatedScores by skillCategoryId
    const categories = Array.from(
      new Set(calculatedScores.map((s) => s.skillCategoryId).filter(Boolean)),
    );

    for (const catId of categories) {
      const catArtisans = calculatedScores.filter(
        (s) => s.skillCategoryId === catId,
      );

      // Now let's calculate ranks. First, we try Town-level buckets.
      // Group by Town
      const towns = Array.from(
        new Set(catArtisans.map((s) => s.town).filter(Boolean)),
      );
      for (const town of towns) {
        const townArtisans = catArtisans.filter((s) => s.town === town);

        if (townArtisans.length >= 10) {
          // Sort by score desc
          townArtisans.sort((a, b) => b.score - a.score);
          for (let i = 0; i < townArtisans.length; i++) {
            const item = townArtisans[i];
            const rank = i + 1;
            const percentile =
              ((townArtisans.length - rank) / townArtisans.length) * 100;

            await this.updateRankCache(
              item.id,
              item.score,
              rank,
              percentile,
              `${item.skill}-${town}`,
            );
            rankCacheCount++;
          }
          continue; // Skip county calculations since town bucket succeeded
        }
      }

      // Group by County
      const counties = Array.from(
        new Set(catArtisans.map((s) => s.county).filter(Boolean)),
      );
      for (const county of counties) {
        const countyArtisans = catArtisans.filter((s) => s.county === county);

        // Sort by score desc
        countyArtisans.sort((a, b) => b.score - a.score);

        if (countyArtisans.length >= 10) {
          for (let i = 0; i < countyArtisans.length; i++) {
            const item = countyArtisans[i];
            // Check if rank was already cached at town-level (which takes precedence)
            const alreadyCachedAtTown = catArtisans.some(
              (s) =>
                s.id === item.id &&
                s.town &&
                catArtisans.filter((t) => t.town === s.town).length >= 10,
            );

            if (!alreadyCachedAtTown) {
              const rank = i + 1;
              const percentile =
                ((countyArtisans.length - rank) / countyArtisans.length) * 100;
              await this.updateRankCache(
                item.id,
                item.score,
                rank,
                percentile,
                `${item.skill}-${county}`,
              );
              rankCacheCount++;
            }
          }
        } else {
          // Thin market fallback: county also has < 10. Fall back to a general level rank badge without percentile.
          for (let i = 0; i < countyArtisans.length; i++) {
            const item = countyArtisans[i];
            const alreadyCached = catArtisans.some(
              (s) =>
                s.id === item.id &&
                s.town &&
                catArtisans.filter((t) => t.town === s.town).length >= 10,
            );
            if (!alreadyCached) {
              const rank = i + 1;
              // Percentile is null, indicating a fallback badge e.g. "Rising Plumber in County"
              await this.updateRankCache(
                item.id,
                item.score,
                rank,
                null,
                `${item.skill}-${county || 'General'}`,
              );
              rankCacheCount++;
            }
          }
        }
      }
    }

    return {
      message: 'Ranks recalculated successfully',
      count: rankCacheCount,
    };
  }

  private async updateRankCache(
    artisanId: string,
    score: number,
    rank: number,
    percentile: number | null,
    resolvedBucket: string,
  ) {
    await this.prisma.artisanRankCache.upsert({
      where: { artisanId },
      create: {
        artisanId,
        cachedScore: score,
        cachedRank: rank,
        cachedPercentile: percentile,
        resolvedBucket,
      },
      update: {
        cachedScore: score,
        cachedRank: rank,
        cachedPercentile: percentile,
        resolvedBucket,
        updatedAt: new Date(),
      },
    });
  }
}
