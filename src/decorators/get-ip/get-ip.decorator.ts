import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { isIP } from 'class-validator';

export function getIpFactory(
  data: unknown,
  ctx: ExecutionContext,
): string | undefined {
  const request = ctx.switchToHttp().getRequest();
  const ip: string =
    request.ip ??
    request.headers['x-forwarded-for'] ??
    request.headers['X-Real-IP'];

  if (isIP(ip)) {
    return ip;
  }
}

/**
 * @description
 * Returns the IP address of the client making the request. Learn how to use it by reading the unit tests.
 */
export const GetIp = createParamDecorator(getIpFactory);
