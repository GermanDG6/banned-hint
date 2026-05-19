import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LobbyNotFoundException } from '../../../modules/lobby/domain/exceptions/lobby-not-found.exception';
import { OnlyDescriberCanException } from '../../../modules/lobby/domain/exceptions/only-describer-can.exception';
import { DescriberAlreadyExistsException } from '../../../modules/lobby/domain/exceptions/describer-already-exists.exception';
import { CardNotFoundException } from '../../../modules/card/domain/exceptions/card-not-found.exception';

type DomainException =
  | LobbyNotFoundException
  | OnlyDescriberCanException
  | DescriberAlreadyExistsException
  | CardNotFoundException;

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

@Catch(
  LobbyNotFoundException,
  OnlyDescriberCanException,
  DescriberAlreadyExistsException,
  CardNotFoundException,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const type = host.getType();

    if (type === 'http') {
      return this.handleHttp(exception, host);
    } else if (type === 'ws') {
      return this.handleWs(exception, host);
    }
  }

  private handleHttp(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.mapExceptionToResponse(exception);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private handleWs(exception: DomainException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient();

    const errorResponse = this.mapExceptionToResponse(exception);
    client.emit('error', {
      message: errorResponse.message,
      code: errorResponse.statusCode,
    });
  }

  private mapExceptionToResponse(exception: DomainException): ErrorResponse {
    if (exception instanceof LobbyNotFoundException) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'Not Found',
      };
    }

    if (exception instanceof OnlyDescriberCanException) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: exception.message,
        error: 'Forbidden',
      };
    }

    if (exception instanceof DescriberAlreadyExistsException) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        error: 'Conflict',
      };
    }

    if (exception instanceof CardNotFoundException) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'Not Found',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      error: 'Internal Server Error',
    };
  }
}
