import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Ip,
  Req,
} from '@nestjs/common';
import { ArtisansService } from './artisans.service';
import { TrustService } from './trust.service';
import { ProfileViewService } from './profile-view.service';
import { CreateArtisanDto } from './dto/create-artisan.dto';
import { UpdateArtisanDto } from './dto/update-artisan.dto';
import { FilterArtisanDto } from './dto/filter-artisan.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('artisans')
@UseGuards(RolesGuard)
export class ArtisansController {
  constructor(
    private readonly artisansService: ArtisansService,
    private readonly trustService: TrustService,
    private readonly profileViewService: ProfileViewService,
  ) {}

  // GET /artisans/me/views-stats — get current artisan's 30-day analytics
  @Roles(Role.ARTISAN)
  @Get('me/views-stats')
  async getMyViewsStats(@CurrentUser() user: any) {
    const artisan = await this.artisansService.findByUserId(user.id);
    return this.profileViewService.getStats30Days(artisan.id);
  }

  // GET /artisans — public, supports ?location=&skill=&county= filters
  @Public()
  @Get()
  findAll(@Query() filter: FilterArtisanDto) {
    return this.artisansService.findAll(filter);
  }

  // GET /artisans/:id — public, full profile with services and reviews
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Dynamically calculate and sync trust score on read
    await this.trustService.calculateTrustScore(id);
    return this.artisansService.findOne(id);
  }

  // POST /artisans/:id/view — public, track a unique profile view
  @Public()
  @Post(':id/view')
  async recordView(@Param('id') id: string, @Ip() ip: string, @Req() req: any) {
    // Decode user if authorization token is passed optionally
    let viewerId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        // simple token payload decode to get viewer user id
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
        viewerId = payload.sub || payload.id || null;
      } catch (e) {
        // ignore malformed tokens
      }
    }
    return this.profileViewService.recordView(id, viewerId, ip);
  }

  // GET /artisans/:id/trust — public, view trust score breakdown events
  @Public()
  @Get(':id/trust')
  async getTrustDetails(@Param('id') id: string) {
    const calculation = await this.trustService.calculateTrustScore(id);
    return {
      artisanId: id,
      trustScore: calculation.trustScore,
      profileCompletion: calculation.profileCompletion,
      events: calculation.breakdown,
    };
  }

  // POST /artisans/recalculate-ranks — admin endpoint to trigger global ranking calculation
  @Roles(Role.ADMIN)
  @Post('recalculate-ranks')
  async recalculateRanks() {
    return this.trustService.recalculateRanks();
  }

  // POST /artisans/me/waitlist — join waitlist for premium feature
  @Roles(Role.ARTISAN)
  @Post('me/waitlist')
  async joinWaitlist(
    @CurrentUser() user: any,
    @Body('featureTag') featureTag: string,
  ) {
    const artisan = await this.artisansService.findByUserId(user.id);
    return this.artisansService.joinWaitlist(artisan.id, featureTag);
  }

  // POST /artisans — authenticated artisan users create their profile
  @Post()
  @Roles(Role.ARTISAN, Role.ADMIN)
  create(@CurrentUser() user: any, @Body() dto: CreateArtisanDto) {
    return this.artisansService.create(user.id, dto);
  }

  // PATCH /artisans/:id — artisan edits own profile, or admin edits any
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArtisanDto,
    @CurrentUser() user: any,
  ) {
    return this.artisansService.update(id, user.id, user.role, dto);
  }

  // DELETE /artisans/:id — artisan deletes own profile, or admin deletes any
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.artisansService.remove(id, user.id, user.role);
  }
}
