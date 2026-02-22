import { GqlExecutionContext } from '@nestjs/graphql';

import { getHeaderFactory } from './get-headers.decorator';

describe(getHeaderFactory.name, () => {
  it('should return all headers when no header name is provided', () => {
    const headers = {
      'authorization': 'Bearer jwt-token',
      'correlation-id': 'f1617c33-5e5d-4bbc-898c-ca122ccfce0c',
    };

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({ req: { headers } }),
    } as GqlExecutionContext);

    const result = getHeaderFactory(undefined, {} as any);

    expect(result).toBe(headers);
  });

  it('should return a specific header by name', () => {
    const headers = {
      'authorization': 'Bearer jwt-token',
      'x-request-id': 'req-123',
    };

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({ req: { headers } }),
    } as GqlExecutionContext);

    const result = getHeaderFactory('Authorization', {} as any);

    expect(result).toBe('Bearer jwt-token');
  });

  it('should return undefined when header does not exist', () => {
    const headers = {
      authorization: 'Bearer token',
    };

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({ req: { headers } }),
    } as GqlExecutionContext);

    const result = getHeaderFactory('x-missing-header', {} as any);

    expect(result).toBeUndefined();
  });
});
