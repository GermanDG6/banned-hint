import { CardNotFoundExceptionFilter } from './card-not-found.exception-filter';
import { CardNotFoundException } from '../../../domain/exceptions/card-not-found.exception';
import { HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

describe('CardNotFoundExceptionFilter', () => {
  let filter: CardNotFoundExceptionFilter;
  let mockResponse: jest.Mocked<Response>;
  let mockHost: jest.Mocked<ArgumentsHost>;

  beforeEach(() => {
    filter = new CardNotFoundExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<Response>;
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as jest.Mocked<ArgumentsHost>;
  });

  it('should catch CardNotFoundException and return 404 status', () => {
    const exception = new CardNotFoundException('Card not found');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should return a JSON response with error details', () => {
    const exception = new CardNotFoundException('No cards available');

    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'No cards available',
      error: 'Not Found',
    });
  });
});
