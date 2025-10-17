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

export const GetIp = createParamDecorator(getIpFactory);
