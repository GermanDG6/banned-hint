import { Test } from '@nestjs/testing';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { LobbyNotFoundException } from '../../../modules/lobby/domain/exceptions/lobby-not-found.exception';
import { OnlyDescriberCanException } from '../../../modules/lobby/domain/exceptions/only-describer-can.exception';
import { DescriberAlreadyExistsException } from '../../../modules/lobby/domain/exceptions/describer-already-exists.exception';
import { CardNotFoundException } from '../../../modules/card/domain/exceptions/card-not-found.exception';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DomainExceptionFilter],
    }).compile();

    filter = moduleRef.get<DomainExceptionFilter>(DomainExceptionFilter);
  });

  describe('HTTP context', () => {
    it('should handle LobbyNotFoundException with 404 status', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockHost: ArgumentsHost = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as any;

      const exception = new LobbyNotFoundException('Test lobby not found');
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Test lobby not found',
          error: 'Not Found',
        }),
      );
    });

    it('should handle OnlyDescriberCanException with 403 status', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockHost: ArgumentsHost = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as any;

      const exception = new OnlyDescriberCanException('Forbidden action');
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.FORBIDDEN,
          error: 'Forbidden',
        }),
      );
    });

    it('should handle DescriberAlreadyExistsException with 409 status', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockHost: ArgumentsHost = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as any;

      const exception = new DescriberAlreadyExistsException('Conflict');
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
        }),
      );
    });

    it('should handle CardNotFoundException with 404 status', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockHost: ArgumentsHost = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as any;

      const exception = new CardNotFoundException('Card not found');
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
        }),
      );
    });
  });

  describe('WebSocket context', () => {
    it('should emit error event for LobbyNotFoundException', () => {
      const mockClient = {
        emit: jest.fn(),
      };

      const mockHost: ArgumentsHost = {
        getType: jest.fn().mockReturnValue('ws'),
        switchToWs: jest.fn().mockReturnValue({
          getClient: jest.fn().mockReturnValue(mockClient),
        }),
      } as any;

      const exception = new LobbyNotFoundException('Test lobby not found');
      filter.catch(exception, mockHost);

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: 'Test lobby not found',
          code: HttpStatus.NOT_FOUND,
        }),
      );
    });

    it('should emit error event for OnlyDescriberCanException', () => {
      const mockClient = {
        emit: jest.fn(),
      };

      const mockHost: ArgumentsHost = {
        getType: jest.fn().mockReturnValue('ws'),
        switchToWs: jest.fn().mockReturnValue({
          getClient: jest.fn().mockReturnValue(mockClient),
        }),
      } as any;

      const exception = new OnlyDescriberCanException('Forbidden action');
      filter.catch(exception, mockHost);

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          code: HttpStatus.FORBIDDEN,
        }),
      );
    });
  });
});
