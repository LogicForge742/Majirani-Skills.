import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateArtisanDto {
  @IsNotEmpty()
  @IsString()
  skill: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsNotEmpty()
  @IsString()
  experience: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  availability?: boolean;
}
