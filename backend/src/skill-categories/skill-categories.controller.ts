import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SkillCategoriesService } from './skill-categories.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateSkillCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

@Controller('skill-categories')
export class SkillCategoriesController {
  constructor(private readonly service: SkillCategoriesService) {}

  // GET /skill-categories — public, used by frontend dropdowns
  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // POST /skill-categories — admin only, add new trade category
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSkillCategoryDto) {
    return this.service.create(dto.name);
  }
}
