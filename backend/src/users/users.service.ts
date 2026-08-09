import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Every guest gets a friendly auto-generated name, e.g. "Guest-4821",
  // matching the "Dexter" style display name shown in the Figma sidebar.
  async createGuest() {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return this.prisma.user.create({
      data: {
        guestName: `Guest-${suffix}`,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
