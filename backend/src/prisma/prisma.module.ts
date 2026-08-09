import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() means we only import PrismaModule once (in AppModule) and every
// other module can still inject PrismaService without listing it in their
// own `imports` array. Reasonable here since almost every module needs DB access.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
