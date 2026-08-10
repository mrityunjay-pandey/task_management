import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// Every route here requires a valid guest session - applying the guard at
// the controller level (rather than on each method) means it's impossible
// to accidentally add a new route and forget to protect it.
@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateTaskDto) {
    const task = await this.tasksService.create(user.id, dto);
    return { data: task, error: null };
  }

  @Get()
  async findAll(@CurrentUser() user: User, @Query() query: TaskQueryDto) {
    const tasks = await this.tasksService.findAll(user.id, query);
    return { data: tasks, error: null };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const task = await this.tasksService.findOne(user.id, id);
    return { data: task, error: null };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.update(user.id, id, dto);
    return { data: task, error: null };
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    const task = await this.tasksService.updateStatus(user.id, id, dto.status);
    return { data: task, error: null };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.tasksService.remove(user.id, id);
  }

  // --- Subtasks ---

  @Get(':id/subtasks')
  async findSubtasks(@CurrentUser() user: User, @Param('id') id: string) {
    const subtasks = await this.tasksService.findSubtasks(user.id, id);
    return { data: subtasks, error: null };
  }

  @Post(':id/subtasks')
  async createSubtask(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateTaskDto,
  ) {
    const subtask = await this.tasksService.createSubtask(user.id, id, dto);
    return { data: subtask, error: null };
  }

  // --- Comments ---

  @Get(':id/comments')
  async findComments(@CurrentUser() user: User, @Param('id') id: string) {
    const comments = await this.tasksService.findComments(user.id, id);
    return { data: comments, error: null };
  }

  @Post(':id/comments')
  async addComment(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.tasksService.addComment(
      user.id,
      id,
      dto.content,
    );
    return { data: comment, error: null };
  }
}
