import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePortfolioItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReorderPortfolioDto {
  @IsArray()
  @IsString({ each: true })
  orderedIds: string[]; // array of PortfolioItem IDs in desired display order
}
