import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtisanDto } from './dto/create-artisan.dto';
import { UpdateArtisanDto } from './dto/update-artisan.dto';
import { FilterArtisanDto } from './dto/filter-artisan.dto';

@Injectable()
export class ArtisansService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterArtisanDto) {
    const { location, skill, county } = filter;

    return this.prisma.artisan.findMany({
      where: {
        ...(location && {
          location: { contains: location, mode: 'insensitive' },
        }),
        ...(skill && {
          skill: { contains: skill, mode: 'insensitive' },
        }),
        ...(county && {
          county: { contains: county, mode: 'insensitive' },
        }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            priceUnit: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    });
  }

  async findOne(id: string) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        services: { where: { isActive: true } },
        reviews: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        rankCache: true,
        portfolio: true,
      },
    });

    if (!artisan)
      throw new NotFoundException(`Artisan with ID ${id} not found.`);
    return artisan;
  }

  async findByUserId(userId: string) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { userId },
      include: {
        rankCache: true,
      },
    });
    if (!artisan)
      throw new NotFoundException(
        `Artisan profile for user ${userId} not found.`,
      );
    return artisan;
  }

  async create(userId: string, dto: CreateArtisanDto) {
    const existing = await this.prisma.artisan.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('You already have an artisan profile.');
    }

    return this.prisma.artisan.create({
      data: { userId, ...dto },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(
    artisanId: string,
    userId: string,
    userRole: string,
    dto: UpdateArtisanDto,
  ) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
    });
    if (!artisan)
      throw new NotFoundException(`Artisan ${artisanId} not found.`);

    if (artisan.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You can only edit your own artisan profile.',
      );
    }

    return this.prisma.artisan.update({
      where: { id: artisanId },
      data: dto,
    });
  }

  async remove(artisanId: string, userId: string, userRole: string) {
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: artisanId },
    });
    if (!artisan)
      throw new NotFoundException(`Artisan ${artisanId} not found.`);

    if (artisan.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You can only delete your own artisan profile.',
      );
    }

    await this.prisma.artisan.delete({ where: { id: artisanId } });
    return { message: 'Artisan profile deleted successfully.' };
  }

  async joinWaitlist(artisanId: string, featureTag: string) {
    if (!['BOOST_SERVICES', 'PREMIUM_ANALYTICS'].includes(featureTag)) {
      throw new BadRequestException('Invalid feature tag.');
    }
    const entry = await this.prisma.waitlistEntry.upsert({
      where: {
        artisanId_featureTag: {
          artisanId,
          featureTag,
        },
      },
      create: {
        artisanId,
        featureTag,
      },
      update: {},
    });
    return {
      success: true,
      message: 'Successfully joined the waitlist.',
      entry,
    };
  }
}
