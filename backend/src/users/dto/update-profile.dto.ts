import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Title must be 100 characters or fewer' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Username must be 50 characters or fewer' })
  username?: string;
}
