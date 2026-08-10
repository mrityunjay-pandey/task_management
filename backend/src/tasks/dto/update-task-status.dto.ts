import { IsEnum } from 'class-validator';
import { TaskStatus } from '@prisma/client';

// A separate, tiny DTO for PATCH /tasks/:id/status - keeps the "mark
// complete/incomplete" action's payload minimal instead of reusing the
// full UpdateTaskDto for a single-field change.
export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus, { message: 'Status must be a valid task status' })
  status: TaskStatus;
}
