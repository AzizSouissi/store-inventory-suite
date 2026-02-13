import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse, FieldValidationError } from '../api/error-response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Unexpected error';
    let error = HttpStatus[status];
    let fieldErrors: FieldValidationError[] | null = null;

    if (isHttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const payload = res as Record<string, unknown>;
        if (typeof payload.message === 'string') {
          message = payload.message;
        } else if (Array.isArray(payload.message)) {
          message = 'Validation failed';
          fieldErrors = payload.message.map((msg) => ({
            field: 'request',
            message: String(msg),
          }));
        }
        if (typeof payload.error === 'string') {
          error = payload.error;
        }
      }
    }

    if (exception instanceof BadRequestException) {
      const res = exception.getResponse() as {
        message?: string[] | string;
        error?: string;
      };
      if (Array.isArray(res?.message)) {
        message = 'Validation failed';
        fieldErrors = res.message.map((msg) => ({
          field: 'request',
          message: String(msg),
        }));
      }
    }

    const body: ErrorResponse = {
      timestamp: new Date().toISOString(),
      status,
      error,
      message,
      path: request.url,
      fieldErrors,
    };

    response.status(status).json(body);
  }
}
