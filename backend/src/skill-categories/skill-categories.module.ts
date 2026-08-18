import { Module } from '@nestjs/common';
import { SkillCategoriesService } from './skill-categories.service';
import { SkillCategoriesController } from './skill-categories.controller';

@Module({
  providers: [SkillCategoriesService],
  controllers: [SkillCategoriesController],
  exports: [SkillCategoriesService],
})
export class SkillCategoriesModule {}
