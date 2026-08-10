import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        leadId: userId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  // Same ownership pattern as TasksService: only projects this guest leads.
  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { leadId: userId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, leadId: userId },
      include: { _count: { select: { tasks: true } } },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.findOne(userId, id); // ownership check
    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { id };
  }

  // Powers the "Projects > Design Homepage" drill-down screen from the design.
  async findTasks(userId: string, projectId: string) {
    await this.findOne(userId, projectId); // ownership check
    return this.prisma.task.findMany({
      where: { projectId, reporterId: userId },
      include: { labels: true, members: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
