import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    guestName: 'Guest-1234',
    email: null,
    title: null,
    username: null,
    theme: 'LIGHT',
    colorMode: 'BLUE',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as never;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createGuest: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('createGuestSession', () => {
    it('creates a new guest user and signs a token for that user id', async () => {
      usersService.createGuest.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('signed-token');

      const result = await authService.createGuestSession();

      expect(usersService.createGuest).toHaveBeenCalledTimes(1);
      // The token must be signed for the user that was actually created,
      // not a hardcoded/stale id - this is the core guarantee auth relies on.
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id });
      expect(result).toEqual({ user: mockUser, token: 'signed-token' });
    });
  });

  describe('validateSession', () => {
    it('returns the user when the token is valid and the user still exists', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser.id });
      usersService.findById.mockResolvedValue(mockUser);

      const result = await authService.validateSession('valid-token');

      expect(result).toEqual(mockUser);
    });

    it('throws UnauthorizedException when the token fails verification', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt malformed'));

      await expect(authService.validateSession('garbage-token')).rejects.toThrow(
        UnauthorizedException,
      );
      // Should never even attempt a user lookup with an unverified token
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the token is valid but the user no longer exists', async () => {
      // Covers the case where a guest's data was deleted after their
      // token was issued - the token alone should never be enough.
      jwtService.verifyAsync.mockResolvedValue({ sub: 'deleted-user-id' });
      usersService.findById.mockResolvedValue(null);

      await expect(authService.validateSession('stale-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
