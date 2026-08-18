import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileViewService {
  constructor(private prisma: PrismaService) {}

  async recordView(
    artisanId: string,
    viewerId: string | null,
    viewerIp: string,
  ) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
    });
    if (!artisan)
      throw new NotFoundException(`Artisan with ID ${artisanId} not found.`);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Dedup logic: Check for existing view from this IP/Viewer within 24h
    const existingView = await this.prisma.profileView.findFirst({
      where: {
        artisanId,
        viewedAt: { gte: oneDayAgo },
        OR: [...(viewerId ? [{ viewerId }] : []), { viewerIp }],
      },
    });

    if (existingView) {
      return {
        recorded: false,
        reason: 'Deduplicated (already viewed within 24h)',
      };
    }

    await this.prisma.profileView.create({
      data: {
        artisanId,
        viewerId,
        viewerIp,
      },
    });

    return { recorded: true };
  }

  async getStats30Days(artisanId: string) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
    });
    if (!artisan)
      throw new NotFoundException(`Artisan with ID ${artisanId} not found.`);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const views = await this.prisma.profileView.findMany({
      where: {
        artisanId,
        viewedAt: { gte: thirtyDaysAgo },
      },
      select: { viewedAt: true },
    });

    // Group views by date
    const dailyViewsMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyViewsMap.set(dateStr, 0);
    }

    for (const view of views) {
      const dateStr = view.viewedAt.toISOString().split('T')[0];
      if (dailyViewsMap.has(dateStr)) {
        dailyViewsMap.set(dateStr, (dailyViewsMap.get(dateStr) || 0) + 1);
      }
    }

    const dailyViews = Array.from(dailyViewsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .reverse();

    return {
      totalViews: views.length,
      dailyViews,
    };
  }
}
