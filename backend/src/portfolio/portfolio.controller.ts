import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import {
  UpdatePortfolioItemDto,
  ReorderPortfolioDto,
} from './dto/update-portfolio-item.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

const imageUpload = FileInterceptor('image', {
  storage: memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|webp|jpg)$/)) {
      cb(new Error('Only JPEG, PNG, and WebP images are accepted.'), false);
    } else {
      cb(null, true);
    }
  },
});

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // GET /portfolio/:artisanId — public, used on public profile pages
  @Public()
  @Get(':artisanId')
  getPortfolio(@Param('artisanId') artisanId: string) {
    return this.portfolioService.getPortfolio(artisanId);
  }

  // POST /portfolio — upload a new portfolio photo
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ARTISAN)
  @UseInterceptors(imageUpload)
  uploadItem(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePortfolioItemDto,
  ) {
    return this.portfolioService.uploadItem(user.artisan.id, file, dto);
  }

  // PATCH /portfolio/:id — update caption or sort order
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ARTISAN)
  updateItem(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdatePortfolioItemDto,
  ) {
    return this.portfolioService.updateItem(id, user.artisan.id, dto);
  }

  // PATCH /portfolio/reorder — save drag-and-drop order
  @Patch('reorder/save')
  @UseGuards(RolesGuard)
  @Roles(Role.ARTISAN)
  reorder(@CurrentUser() user: any, @Body() dto: ReorderPortfolioDto) {
    return this.portfolioService.reorder(user.artisan.id, dto);
  }

  // DELETE /portfolio/:id — remove photo from portfolio and Cloudinary
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ARTISAN)
  deleteItem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.portfolioService.deleteItem(id, user.artisan.id);
  }
}
