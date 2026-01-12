const mockedResponse = { setHeader: jest.fn() };

import { Test } from '@nestjs/testing';
import { ClsModule, ClsService } from 'nestjs-cls';
import { firstValueFrom, of } from 'rxjs';

import {
  CORRELATION_ID_CLS_KEY,
  CORRELATION_ID_HEADER_NAME,
} from './correlation-id.constant';
import { CorrelationIdInterceptor } from './correlation-id.interceptor';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn().mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: { headers: {}, res: mockedResponse },
      }),
      getInfo: jest.fn().mockReturnValue({
        operation: { operation: 'query' },
      }),
    }),
  },
}));

describe('CorrelationIdInterceptor', () => {
  let uut: CorrelationIdInterceptor;
  let clsService: jest.Mocked<ClsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          global: true,
          interceptor: { mount: true },
          guard: { mount: true },
          middleware: { mount: true },
        }),
      ],
      providers: [CorrelationIdInterceptor],
    }).compile();

    uut = module.get(CorrelationIdInterceptor);
    clsService = module.get(ClsService);
  });

  it.each(['http', 'graphql', 'rpc'])(
    'should store the correlation ID in nestjs-cls storage when request type is %s',
    (type) => {
      const mockedExecutionContext: any = {
        getType: jest.fn(() => type),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ headers: {} }),
        }),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue(['correlation uuid']),
          }),
        }),
      };
      const mockedNext = {
        handle: jest.fn(() => of({})),
      };
      jest.spyOn(clsService, 'set');

      uut.intercept(mockedExecutionContext, mockedNext);

      expect(clsService.set).toHaveBeenCalledWith(
        CORRELATION_ID_CLS_KEY,
        expect.any(String),
      );
    },
  );

  it('should attach correlation ID to the response header when request type is http', async () => {
    const mockedResponseHeaders = { headers: { append: jest.fn() } };
    const mockedResponse = jest
      .fn()
      .mockReturnValue(mockedResponseHeaders);
    const mockedExecutionContext: any = {
      getType: jest.fn(() => 'http'),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers: {} }),
        getResponse: mockedResponse,
      }),
    };
    const mockedNext = {
      handle: jest.fn(() => of({})),
    };

    await firstValueFrom(
      uut.intercept(mockedExecutionContext, mockedNext),
    );

    expect(mockedResponseHeaders.headers.append).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER_NAME,
      expect.any(String),
    );
  });

  it('should attach correlation ID to the response header when request type is graphql', async () => {
    const mockedExecutionContext: any = {
      getType: jest.fn(() => 'graphql'),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers: {} }),
      }),
    };
    const mockedNext = {
      handle: jest.fn(() => of({})),
    };

    await firstValueFrom(
      uut.intercept(mockedExecutionContext, mockedNext),
    );

    expect(mockedResponse.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER_NAME,
      expect.any(String),
    );
  });

  it('should attach correlation ID to the response metadata when request type is rpc', async () => {
    const mockedMetadata = {
      get: jest.fn().mockReturnValue([]),
      set: jest.fn(),
    };
    const mockedExecutionContext: any = {
      getType: jest.fn(() => 'rpc'),
      switchToRpc: jest.fn().mockReturnValue({
        getContext: jest.fn().mockReturnValue(mockedMetadata),
      }),
    };
    const mockedNext = {
      handle: jest.fn(() => of({})),
    };

    await firstValueFrom(
      uut.intercept(mockedExecutionContext, mockedNext),
    );

    expect(mockedMetadata.set).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER_NAME,
      expect.any(String),
    );
  });
});
