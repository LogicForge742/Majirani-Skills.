import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        ...(category && {
          category: { contains: category, mode: 'insensitive' },
        }),
      },
      include: {
        artisan: {
          select: {
            id: true,
            skill: true,
            location: true,
            rating: true,
            verified: true,
            user: { select: { name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        artisan: {
          include: {
            user: { select: { name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!service)
      throw new NotFoundException(`Service with ID ${id} not found.`);
    return service;
  }

  async findByArtisan(artisanId: string) {
    return this.prisma.service.findMany({
      where: { artisanId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateServiceDto) {
    // Validate the artisan belongs to this user
    const artisan = await this.prisma.artisan.findUnique({
      where: { id: dto.artisanId },
    });

    if (!artisan) throw new NotFoundException('Artisan profile not found.');

    if (artisan.userId !== userId) {
      throw new ForbiddenException(
        'You can only add services to your own artisan profile.',
      );
    }

    return this.prisma.service.create({
      data: dto,
    });
  }

  async update(
    serviceId: string,
    userId: string,
    userRole: string,
    dto: UpdateServiceDto,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { artisan: true },
    });

    if (!service)
      throw new NotFoundException(`Service ${serviceId} not found.`);

    if (service.artisan.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only edit your own services.');
    }

    return this.prisma.service.update({ where: { id: serviceId }, data: dto });
  }

  async remove(serviceId: string, userId: string, userRole: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { artisan: true },
    });

    if (!service)
      throw new NotFoundException(`Service ${serviceId} not found.`);

    if (service.artisan.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own services.');
    }

    await this.prisma.service.delete({ where: { id: serviceId } });
    return { message: 'Service deleted successfully.' };
  }
}
