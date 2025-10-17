import { getIpFactory } from './get-ip.decorator';

describe('getIpFactory', () => {
  it('should return request.ip if valid', () => {
    const expectedIp = '127.0.0.1';
    const mockCtx = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ ip: expectedIp }),
      }),
    } as any;

    const result = getIpFactory(undefined, mockCtx);

    expect(result).toBe(expectedIp);
  });

  it('should return x-forwarded-for if request.ip is invalid but x-forwarded-for is valid', () => {
    const mockCtx = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: undefined,
          headers: {
            'x-forwarded-for': '8.8.8.8',
          },
        }),
      }),
    } as any;

    const result = getIpFactory(undefined, mockCtx);

    expect(result).toBe('8.8.8.8');
  });

  it('should return X-Real-IP if others are missing', () => {
    const mockCtx = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: undefined,
          headers: {
            'X-Real-IP': '10.0.0.1',
          },
        }),
      }),
    } as any;

    const result = getIpFactory(undefined, mockCtx);

    expect(result).toBe('10.0.0.1');
  });

  it('should return undefined if no IP available', () => {
    const mockCtx = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest
          .fn()
          .mockReturnValue({ ip: undefined, headers: {} }),
      }),
    } as any;

    const result = getIpFactory(undefined, mockCtx);

    expect(result).toBeUndefined();
  });

  it('should return undefined if found IP is not valid', () => {
    const mockCtx = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: 'invalid-ip',
          headers: {},
        }),
      }),
    } as any;

    const result = getIpFactory(undefined, mockCtx);

    expect(result).toBeUndefined();
  });
});
