import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET /reviews/artisan/:artisanId — public
  @Public()
  @Get('artisan/:artisanId')
  findByArtisan(@Param('artisanId') artisanId: string) {
    return this.reviewsService.findByArtisan(artisanId);
  }

  // POST /reviews — auth required (handled by global JwtGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }
}
