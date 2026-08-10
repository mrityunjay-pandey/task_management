import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Catches every unhandled exception in the app and converts it into the
// same { data: null, error: { message, statusCode } } shape the frontend
// expects everywhere else - so it never has to special-case error responses.
// Also makes sure raw Prisma/Node errors never reach the client as-is.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? exception.getResponse()
      : 'Something went wrong. Please try again.';

    // Log the full error server-side (with stack trace) for debugging,
    // but never send that detail back in the HTTP response.
    if (!isHttpException) {
      this.logger.error(exception);
    }

    response.status(status).json({
      data: null,
      error: {
        statusCode: status,
        message: typeof message === 'string' ? message : (message as any).message,
      },
    });
  }
}
