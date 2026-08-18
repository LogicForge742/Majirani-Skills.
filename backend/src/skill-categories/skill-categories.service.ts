import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.skillCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.skillCategory.findUnique({
      where: { id },
    });
    if (!category)
      throw new NotFoundException(`Skill category ${id} not found.`);
    return category;
  }

  async create(name: string) {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const existing = await this.prisma.skillCategory.findUnique({
      where: { slug },
    });
    if (existing)
      throw new ConflictException(`Skill category "${name}" already exists.`);
    return this.prisma.skillCategory.create({ data: { name, slug } });
  }
}
