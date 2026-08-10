import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // credentials: true is required so the browser will send/receive the
  // httpOnly session cookie across origins (frontend on :3000, backend on :4000).
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:3000',
    credentials: true,
  });

  // Global validation: every DTO decorated with class-validator decorators
  // gets automatically validated before it reaches a controller method.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips any fields not declared on the DTO
      forbidNonWhitelisted: true, // rejects requests that send extra/unknown fields
      transform: true, // converts plain JSON into DTO class instances
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
