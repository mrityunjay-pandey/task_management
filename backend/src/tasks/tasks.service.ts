import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus, Priority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

// Shared "include" shape so every query that returns a task includes the
// same related data (labels, members, subtask count) consistently, instead
// of repeating this object in five different methods.
const taskInclude = {
  labels: true,
  members: { include: { user: true } },
  subtasks: true,
  _count: { select: { comments: true, subtasks: true } },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    const { labelNames, ...rest } = dto;

    return this.prisma.task.create({
      data: {
        ...rest,
        reporterId: userId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        // connectOrCreate avoids duplicate Label rows for labels that
        // already exist (e.g. two tasks both tagged "Deployment").
        labels: labelNames
          ? {
              connectOrCreate: labelNames.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: taskInclude,
    });
  }

  // Only ever returns tasks this user reported themselves - this is the
  // single place that enforces "guests can't see each other's tasks."
  async findAll(userId: string, query: TaskQueryDto) {
    const where: Prisma.TaskWhereInput = {
      reporterId: userId,
      parentTaskId: null, // top-level tasks only; subtasks are fetched separately
      status: query.status,
      priority: query.priority,
      projectId: query.projectId,
      title: query.search
        ? { contains: query.search, mode: 'insensitive' }
        : undefined,
    };

    return this.prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, reporterId: userId },
      include: {
        ...taskInclude,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    // NotFoundException (not Forbidden) on purpose: if a guest tries another
    // guest's task id, we don't want to confirm "it exists, you just can't see it" -
    // that would leak information about what ids are valid.
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const existing = await this.findOne(userId, id); // also enforces ownership
    const { labelNames, ...rest } = dto;

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        labels: labelNames
          ? {
              set: [], // clear existing links before reconnecting - simplest way to fully replace the label set
              connectOrCreate: labelNames.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: taskInclude,
    });

    await this.logChanges(id, existing, updated);
    return updated;
  }

  async updateStatus(userId: string, id: string, status: TaskStatus) {
    const existing = await this.findOne(userId, id);
    const updated = await this.prisma.task.update({
      where: { id },
      data: { status },
      include: taskInclude,
    });

    if (existing.status !== status) {
      await this.logActivity(
        id,
        `changed status from ${existing.status} to ${status}`,
      );
    }
    return updated;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // ownership check
    await this.prisma.task.delete({ where: { id } });
    return { id };
  }

  // --- Subtasks (just Tasks with parentTaskId set) ---

  async findSubtasks(userId: string, parentTaskId: string) {
    await this.findOne(userId, parentTaskId); // ownership check on the parent
    return this.prisma.task.findMany({
      where: { parentTaskId },
      include: taskInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSubtask(userId: string, parentTaskId: string, dto: CreateTaskDto) {
    await this.findOne(userId, parentTaskId); // ownership check on the parent
    return this.create(userId, { ...dto, parentTaskId });
  }

  // --- Comments ---

  async findComments(userId: string, taskId: string) {
    await this.findOne(userId, taskId);
    return this.prisma.comment.findMany({
      where: { taskId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(userId: string, taskId: string, content: string) {
    await this.findOne(userId, taskId);
    return this.prisma.comment.create({
      data: { taskId, authorId: userId, content },
      include: { author: true },
    });
  }

  // --- Activity log (system-written only, never client-writable) ---

  private async logActivity(taskId: string, message: string) {
    await this.prisma.activity.create({ data: { taskId, message } });
  }

  // Compares old vs new task and writes one activity line per changed
  // tracked field, so the "Updates" feed in the design reflects real changes.
  private async logChanges(
    taskId: string,
    before: { status: TaskStatus; priority: Priority },
    after: { status: TaskStatus; priority: Priority },
  ) {
    if (before.status !== after.status) {
      await this.logActivity(
        taskId,
        `changed status from ${before.status} to ${after.status}`,
      );
    }
    if (before.priority !== after.priority) {
      await this.logActivity(
        taskId,
        `changed priority from ${before.priority} to ${after.priority}`,
      );
    }
  }
}
