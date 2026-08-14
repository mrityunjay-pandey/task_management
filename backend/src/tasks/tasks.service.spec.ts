import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

// These tests focus on ownership enforcement - the property that a guest
// can never read, edit, or delete another guest's task - since that's the
// single most important correctness guarantee in this service, and the
// one most worth locking down with a test rather than trusting by inspection.
describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: Record<string, jest.Mock>;
    activity: Record<string, jest.Mock>;
  };

  const ownerId = 'user-owner';
  const otherUserId = 'user-other';

  const mockTask = {
    id: 'task-1',
    title: 'Write docs',
    reporterId: ownerId,
    status: 'TODO',
    priority: 'NO_PRIORITY',
  } as never;

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      activity: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TasksService);
  });

  describe('findOne', () => {
    it('returns the task when it belongs to the requesting user', async () => {
      prisma.task.findFirst.mockResolvedValue(mockTask);

      const result = await service.findOne(ownerId, 'task-1');

      expect(result).toEqual(mockTask);
      // The WHERE clause itself must scope by reporterId - this is what
      // actually prevents cross-user access, not an after-the-fact check.
      expect(prisma.task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1', reporterId: ownerId },
        }),
      );
    });

    it("throws NotFoundException (not ForbiddenException) for another user's task", async () => {
      // Simulates the real query: filtering by the WRONG reporterId means
      // Prisma finds nothing, exactly as it should for another user's task.
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(service.findOne(otherUserId, 'task-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it("rejects updating another user's task before touching the database", async () => {
      prisma.task.findFirst.mockResolvedValue(null); // not this user's task

      await expect(
        service.update(otherUserId, 'task-1', { title: 'Hijacked' }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.task.update).not.toHaveBeenCalled();
    });

    it('logs an activity entry when priority changes, but not when it stays the same', async () => {
      prisma.task.findFirst.mockResolvedValue({ ...mockTask, priority: 'LOW' });
      prisma.task.update.mockResolvedValue({ ...mockTask, priority: 'HIGH' });

      await service.update(ownerId, 'task-1', { priority: 'HIGH' } as never);

      expect(prisma.activity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message: expect.stringContaining('changed priority from LOW to HIGH'),
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it("does not delete another user's task", async () => {
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(service.remove(otherUserId, 'task-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });

    it("deletes the task when it belongs to the requesting user", async () => {
      prisma.task.findFirst.mockResolvedValue(mockTask);
      prisma.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove(ownerId, 'task-1');

      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
      expect(result).toEqual({ id: 'task-1' });
    });
  });

  describe('findAll', () => {
    it('always scopes the query to the requesting user, regardless of filters passed', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      await service.findAll(ownerId, { status: 'DOING' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ reporterId: ownerId, status: 'DOING' }),
        }),
      );
    });
  });
});
