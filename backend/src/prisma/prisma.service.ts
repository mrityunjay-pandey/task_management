import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Wrapping PrismaClient in a Nest-injectable service (rather than importing
// a shared client directly) means it participates in Nest's lifecycle hooks
// and can be injected into any service via the constructor, like any other
// provider.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
