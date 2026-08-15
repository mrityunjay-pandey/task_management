import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Deployment platforms (Render/Railway/Fly) ping the root path to check
  // the service is up before routing traffic to it - returning a simple
  // 200 here (instead of nothing, or a 404) is what makes that health
  // check pass.
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
