import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  // Powers the Profile settings screen (Figma "Blocks / Sidebar-02").
  // Guests can set an email/title/username even though they never
  // "registered" one - matches the design showing these as editable fields.
  async updateProfile(id: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }
}
