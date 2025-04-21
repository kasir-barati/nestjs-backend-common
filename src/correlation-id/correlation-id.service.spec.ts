import { CorrelationIdService } from './correlation-id.service';

describe('CorrelationIdService', () => {
  let service: CorrelationIdService;
  let clsService: any;

  beforeEach(() => {
    clsService = {};
    service = new CorrelationIdService(clsService);
  });

  it('should return the correlation ID', () => {
    clsService.get = jest.fn(() => 'correlation uuid');

    const correlationId = service.correlationId;

    expect(correlationId).toBe('correlation uuid');
  });

  it('should generate a new UUID in case we did not have a correlation ID', () => {
    clsService.get = jest.fn(() => undefined);

    const correlationId = service.correlationId;

    expect(correlationId).toBeString();
  });
});
