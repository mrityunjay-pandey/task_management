import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

// PartialType takes every field from CreateTaskDto and makes it optional,
// while keeping the same validation rules for any field that IS present.
// This means an edit request can send just the one field that changed
// (e.g. { title: "New title" }) without re-sending the whole task.
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
