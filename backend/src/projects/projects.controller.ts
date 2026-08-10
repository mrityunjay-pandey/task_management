import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(user.id, dto);
    return { data: project, error: null };
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const projects = await this.projectsService.findAll(user.id);
    return { data: projects, error: null };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const project = await this.projectsService.findOne(user.id, id);
    return { data: project, error: null };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.update(user.id, id, dto);
    return { data: project, error: null };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.projectsService.remove(user.id, id);
  }

  @Get(':id/tasks')
  async findTasks(@CurrentUser() user: User, @Param('id') id: string) {
    const tasks = await this.projectsService.findTasks(user.id, id);
    return { data: tasks, error: null };
  }
}
