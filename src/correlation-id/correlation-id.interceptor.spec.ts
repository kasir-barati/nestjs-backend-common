import { CORRELATION_ID_CLS_KEY } from './correlation-id.constant';
import { CorrelationIdInterceptor } from './correlation-id.interceptor';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn().mockReturnValue({
      getContext: jest.fn().mockReturnValue({ req: { headers: {} } }),
    }),
  },
}));

describe('CorrelationIdInterceptor', () => {
  let service: CorrelationIdInterceptor;
  let clsService: any;

  beforeEach(() => {
    clsService = {};
    service = new CorrelationIdInterceptor(clsService);
  });

  it.each(['http', 'graphql', 'rpc'])(
    'should store the correlation ID in nestjs-cls storage',
    (type) => {
      clsService.set = jest.fn();
      const executionContext: any = {
        getType: jest.fn(() => type),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ headers: {} }),
        }),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest
            .fn()
            .mockReturnValue({ correlationId: 'correlation uuid' }),
        }),
      };

      service.intercept(executionContext, { handle: jest.fn() });

      expect(clsService.set).toHaveBeenCalledWith(
        CORRELATION_ID_CLS_KEY,
        expect.any(String),
      );
    },
  );
});
