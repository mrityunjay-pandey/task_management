import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

export interface SessionPayload {
  sub: string; // user id - "sub" (subject) is the standard JWT claim name
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Creates a brand new guest user and returns a signed token for them.
  // This is the only "login method" for now - swapping in Google OAuth later
  // means adding a sibling method here (e.g. loginWithGoogle) that resolves
  // an existing/new User the same way, then reuses this same token signing.
  async createGuestSession() {
    const user = await this.usersService.createGuest();
    const token = await this.signToken(user.id);
    return { user, token };
  }

  async signToken(userId: string): Promise<string> {
    const payload: SessionPayload = { sub: userId };
    return this.jwtService.signAsync(payload);
  }

  // Verifies a token and returns the user it belongs to, or throws.
  // Used by the guard on every protected request.
  async validateSession(token: string) {
    let payload: SessionPayload;
    try {
      payload = await this.jwtService.verifyAsync<SessionPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Session user no longer exists');
    }
    return user;
  }
}
