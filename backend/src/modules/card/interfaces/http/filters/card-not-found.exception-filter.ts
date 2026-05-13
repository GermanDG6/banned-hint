import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CardNotFoundException } from '../../../domain/exceptions/card-not-found.exception';

@Catch(CardNotFoundException)
export class CardNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: CardNotFoundException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
      error: 'Not Found',
    });
  }
}
