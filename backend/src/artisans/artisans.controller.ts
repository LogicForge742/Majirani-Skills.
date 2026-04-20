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
} from '@nestjs/common';
import { ArtisansService } from './artisans.service';
import { CreateArtisanDto } from './dto/create-artisan.dto';
import { UpdateArtisanDto } from './dto/update-artisan.dto';
import { FilterArtisanDto } from './dto/filter-artisan.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('artisans')
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) {}

  // GET /artisans — public, supports ?location=&skill=&county= filters
  @Public()
  @Get()
  findAll(@Query() filter: FilterArtisanDto) {
    return this.artisansService.findAll(filter);
  }

  // GET /artisans/:id — public, full profile with services and reviews
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artisansService.findOne(id);
  }

  // POST /artisans — authenticated artisan users create their profile
  @Post()
  @UseGuards(RolesGuard)
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
