import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByArtisan(artisanId: string) {
    return this.prisma.review.findMany({
      where: { artisanId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateReviewDto) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: dto.artisanId },
    });

    if (!artisan) throw new NotFoundException('Artisan not found.');

    if (artisan.userId === userId) {
      throw new ForbiddenException('You cannot review yourself.');
    }

    // Check if the user has already reviewed this artisan
    const existingReview = await this.prisma.review.findFirst({
      where: {
        artisanId: dto.artisanId,
        authorId: userId,
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this artisan.');
    }

    // Use transaction to ensure aggregate updates
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          artisanId: dto.artisanId,
          authorId: userId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      // Recalculate average rating
      const aggregates = await tx.review.aggregate({
        where: { artisanId: dto.artisanId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.artisan.update({
        where: { id: dto.artisanId },
        data: {
          rating: aggregates._avg.rating || 0,
          reviewCount: aggregates._count.rating,
        },
      });

      return review;
    });
  }
}
