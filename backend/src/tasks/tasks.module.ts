import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // needed because TasksController uses AuthGuard
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
