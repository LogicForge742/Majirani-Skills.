import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // GET /services — public, ?category= filter supported
  @Public()
  @Get()
  findAll(@Query('category') category?: string) {
    return this.servicesService.findAll(category);
  }

  // GET /services/:id — public
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  // GET /services/artisan/:artisanId — all services by a specific artisan
  @Public()
  @Get('artisan/:artisanId')
  findByArtisan(@Param('artisanId') artisanId: string) {
    return this.servicesService.findByArtisan(artisanId);
  }

  // POST /services — authenticated artisan creates a service
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(user.id, dto);
  }

  // PATCH /services/:id — authenticated artisan edits own service
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: any,
  ) {
    return this.servicesService.update(id, user.id, user.role, dto);
  }

  // DELETE /services/:id — authenticated artisan deletes own service
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.servicesService.remove(id, user.id, user.role);
  }
}
