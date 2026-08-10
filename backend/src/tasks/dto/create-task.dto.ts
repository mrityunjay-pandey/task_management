import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsISO8601,
  IsArray,
  MaxLength,
} from 'class-validator';
import { TaskStatus, Priority } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be 200 characters or fewer' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be 2000 characters or fewer' })
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be a valid task status' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority, { message: 'Priority must be a valid priority level' })
  priority?: Priority;

  // ISO8601 strings from the frontend date picker (e.g. "2026-09-12T00:00:00.000Z")
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  // Set when creating a subtask - the parent task's id
  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labelNames?: string[];
}
