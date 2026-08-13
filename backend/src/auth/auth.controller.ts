import {
  Controller,
  Post,
  Get,
  Patch,
  Res,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

const SESSION_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // "Continue as Guest" button on the login screen calls this.
  // We set the token as an httpOnly cookie rather than returning it in the
  // JSON body - that way the frontend never has to store or attach it
  // manually, and it can't be read by client-side JS (a bit safer against XSS).
  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  async guestLogin(@Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.createGuestSession();

    res.cookie('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE_MS,
      // secure:true is required for cookies over HTTPS in production;
      // left conditional so local http://localhost dev still works.
      secure: process.env.NODE_ENV === 'production',
    });

    return { data: this.toPublicUser(user), error: null };
  }

  // Frontend calls this on app load to check "am I still logged in?"
  // after a refresh. AuthGuard does the actual verification.
  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return { data: this.toPublicUser(user), error: null };
  }

  // Powers the Profile settings screen - PATCH lives under /auth rather
  // than a separate /users controller because this is specifically "update
  // MY OWN profile", which is conceptually part of the current session,
  // not general user management (which this app doesn't have - guests
  // can't look up or edit other users).
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return { data: this.toPublicUser(updated), error: null };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('session');
  }

  // Keep only fields the frontend actually needs - never leak internal ids
  // beyond what's necessary or any future sensitive fields by accident.
  private toPublicUser(user: User) {
    return {
      id: user.id,
      guestName: user.guestName,
      email: user.email,
      title: user.title,
      username: user.username,
      theme: user.theme,
      colorMode: user.colorMode,
    };
  }
}
