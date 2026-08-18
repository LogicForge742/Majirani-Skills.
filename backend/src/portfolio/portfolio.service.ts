import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProfileCompletionService } from '../verification/profile-completion.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import {
  UpdatePortfolioItemDto,
  ReorderPortfolioDto,
} from './dto/update-portfolio-item.dto';

const MAX_PORTFOLIO_ITEMS = 20;

@Injectable()
export class PortfolioService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private profileCompletion: ProfileCompletionService,
  ) {}

  // ─── Get Artisan's Portfolio (public) ─────────────────────

  async getPortfolio(artisanId: string) {
    return this.prisma.portfolioItem.findMany({
      where: { artisanId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        sortOrder: true,
        createdAt: true,
      },
    });
  }

  // ─── Upload New Portfolio Photo ────────────────────────────

  async uploadItem(
    artisanId: string,
    file: Express.Multer.File,
    dto: CreatePortfolioItemDto,
  ) {
    if (!file) throw new BadRequestException('An image file is required.');

    // Enforce max portfolio size
    const count = await this.prisma.portfolioItem.count({
      where: { artisanId },
    });
    if (count >= MAX_PORTFOLIO_ITEMS) {
      throw new BadRequestException(
        `Portfolio is limited to ${MAX_PORTFOLIO_ITEMS} photos. Delete some to add more.`,
      );
    }

    const folder = `majirani/portfolio/${artisanId}`;
    const { url, publicId } = await this.storage.uploadBuffer(
      file.buffer,
      folder,
    );

    // sortOrder defaults to the end of the list
    const nextOrder = dto.sortOrder ?? count;

    const item = await this.prisma.portfolioItem.create({
      data: {
        artisanId,
        imageUrl: url,
        publicId,
        caption: dto.caption,
        sortOrder: nextOrder,
      },
    });

    // Recompute profile completion — portfolio is a signal
    await this.profileCompletion.recompute(artisanId);

    return item;
  }

  // ─── Update Caption ────────────────────────────────────────

  async updateItem(
    itemId: string,
    artisanId: string,
    dto: UpdatePortfolioItemDto,
  ) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Portfolio item not found.');
    if (item.artisanId !== artisanId)
      throw new ForbiddenException('Not your portfolio item.');

    return this.prisma.portfolioItem.update({
      where: { id: itemId },
      data: { caption: dto.caption, sortOrder: dto.sortOrder },
    });
  }

  // ─── Reorder (drag-and-drop) ───────────────────────────────

  async reorder(artisanId: string, dto: ReorderPortfolioDto) {
    // Verify all IDs belong to this artisan
    const items = await this.prisma.portfolioItem.findMany({
      where: { artisanId, id: { in: dto.orderedIds } },
      select: { id: true },
    });

    if (items.length !== dto.orderedIds.length) {
      throw new ForbiddenException(
        'Some portfolio item IDs are invalid or do not belong to you.',
      );
    }

    // Batch update sortOrder
    await this.prisma.$transaction(
      dto.orderedIds.map((id, index) =>
        this.prisma.portfolioItem.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return { message: 'Portfolio order updated.' };
  }

  // ─── Delete Item ───────────────────────────────────────────

  async deleteItem(itemId: string, artisanId: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Portfolio item not found.');
    if (item.artisanId !== artisanId)
      throw new ForbiddenException('Not your portfolio item.');

    // Delete from Cloudinary first
    await this.storage.deleteByPublicId(item.publicId);

    await this.prisma.portfolioItem.delete({ where: { id: itemId } });

    // Recompute profile completion
    await this.profileCompletion.recompute(artisanId);

    return { message: 'Portfolio item deleted.' };
  }
}
