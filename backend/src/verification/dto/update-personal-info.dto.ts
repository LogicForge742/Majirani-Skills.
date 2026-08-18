import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class UpdatePersonalInfoDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  town?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  skillCategoryId?: string;

  @IsOptional()
  @IsString()
  experience?: string;
}
