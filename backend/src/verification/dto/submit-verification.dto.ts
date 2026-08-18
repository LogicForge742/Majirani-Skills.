import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SubmitVerificationDto {
  @IsNotEmpty()
  @IsString()
  @Length(7, 10)
  nationalIdNumber: string;
}
