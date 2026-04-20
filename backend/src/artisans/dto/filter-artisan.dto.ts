import { IsOptional, IsString } from 'class-validator';

export class FilterArtisanDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  skill?: string;

  @IsOptional()
  @IsString()
  county?: string;
}
