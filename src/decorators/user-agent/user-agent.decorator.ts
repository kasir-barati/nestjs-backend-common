import { ApiParam } from '@nestjs/swagger';

/**
 * @description Adds optional user agent to an endpoint.
 */
export const ApiUserAgent =
  (): MethodDecorator =>
  (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiParam({
      name: 'User-Agent',
      required: false,
      description: '(Leave empty. browser send it automatically)',
      example:
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
    })(target, propertyKey, descriptor);
  };
