import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';

// Applied to any controller/route that requires a logged-in (guest) user.
// It reads the httpOnly session cookie, verifies it via AuthService, and
// attaches the resolved user to `request.user` so route handlers (and the
// @CurrentUser() decorator) can access it.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.session as string | undefined;

    if (!token) {
      throw new UnauthorizedException('No session found');
    }

    const user = await this.authService.validateSession(token);
    (request as Request & { user: typeof user }).user = user;
    return true;
  }
}
