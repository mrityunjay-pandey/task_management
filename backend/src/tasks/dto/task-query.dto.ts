import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TaskStatus, Priority } from '@prisma/client';

// Validates ?status=&priority=&search=&projectId= on GET /tasks.
// Query params always arrive as strings, so this also acts as documentation
// of exactly what the frontend is allowed to send.
export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}
