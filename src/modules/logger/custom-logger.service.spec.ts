import { CustomLoggerService } from './custom-logger.service';

describe(CustomLoggerService.name, () => {
  let service: CustomLoggerService;
  let winstonLogger: { log: jest.Mock };

  beforeEach(() => {
    winstonLogger = { log: jest.fn() };

    service = new CustomLoggerService(winstonLogger as any);
  });

  describe('setContext', () => {
    it('should set default context used by log methods', () => {
      // Act
      service.setContext('AppService');
      service.log('hello');

      // Assert
      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'AppService',
        level: 'info',
        message: 'hello',
      });
    });
  });

  describe('log', () => {
    it('should log with provided string context', () => {
      service.log('hello', 'UsersResolver');

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'UsersResolver',
        level: 'info',
        message: 'hello',
      });
    });

    it('should log with metadata object and explicit context', () => {
      service.log('hello', {
        context: 'UsersResolver',
        correlationId: 'dde5b29e-1ab3-43a5-ab3c-9a983fcaac34',
        requestId: 'r-1',
      });

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'UsersResolver',
        correlationId: 'dde5b29e-1ab3-43a5-ab3c-9a983fcaac34',
        level: 'info',
        message: 'hello',
        requestId: 'r-1',
      });
    });

    it('should fallback to service context when metadata context is missing', () => {
      service.setContext('FallbackContext');

      service.log('hello', {
        correlationId: '92df3528-3c51-43a8-bbbe-3b54f4d725e7',
      });

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'FallbackContext',
        correlationId: '92df3528-3c51-43a8-bbbe-3b54f4d725e7',
        level: 'info',
        message: 'hello',
      });
    });
  });

  describe('error', () => {
    it('should log with stack trace and explicit context', () => {
      service.error('oops', 'stack-trace', 'AuthService');

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'AuthService',
        level: 'error',
        message: 'oops',
        stack: 'stack-trace',
      });
    });

    it('should log with stack trace and fallback to service context', () => {
      service.setContext('FallbackContext');

      service.error('oops', 'stack-trace');

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'FallbackContext',
        level: 'error',
        message: 'oops',
        stack: 'stack-trace',
      });
    });

    it('should log with metadata object', () => {
      service.error('oops', {
        context: 'PaymentService',
        correlationId: '7f3743ec-ddd4-40cc-b06a-8ede34b49799',
        reason: 'timeout',
      });

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'PaymentService',
        correlationId: '7f3743ec-ddd4-40cc-b06a-8ede34b49799',
        level: 'error',
        message: 'oops',
        reason: 'timeout',
      });
    });
  });

  describe('warn', () => {
    it('should log with provided string context', () => {
      service.warn('warning', 'UsersResolver');

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'UsersResolver',
        level: 'warn',
        message: 'warning',
      });
    });
  });

  describe('debug', () => {
    it('should log with metadata object', () => {
      service.debug('debugging', {
        correlationId: '87647e8b-b9f2-45a8-a1e0-3fbd5ead46e8',
        step: 'validate',
      });

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: undefined,
        correlationId: '87647e8b-b9f2-45a8-a1e0-3fbd5ead46e8',
        level: 'debug',
        message: 'debugging',
        step: 'validate',
      });
    });
  });

  describe('verbose', () => {
    it('should log with service context when no context/meta is provided', () => {
      service.setContext('AppService');

      service.verbose('details');

      expect(winstonLogger.log).toHaveBeenCalledWith({
        context: 'AppService',
        level: 'verbose',
        message: 'details',
      });
    });
  });
});
