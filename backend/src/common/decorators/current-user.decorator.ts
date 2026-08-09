import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

// Lets a controller write `@CurrentUser() user: User` instead of manually
// pulling `request.user` out of the request object every time. AuthGuard is
// responsible for putting the user there in the first place.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
    return request.user;
  },
);
