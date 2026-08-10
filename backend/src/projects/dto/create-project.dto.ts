import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsISO8601,
  MaxLength,
} from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
