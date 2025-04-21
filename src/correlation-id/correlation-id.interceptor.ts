import type { Request } from 'express';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { randomUUID } from 'crypto';
import { ClsService } from 'nestjs-cls';

import { CommonExecutionContext } from '../types';
import {
  CORRELATION_ID_CLS_KEY,
  CORRELATION_ID_HEADER_NAME,
} from './correlation-id.constant';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  private logger = new Logger(CorrelationIdInterceptor.name);

  constructor(private readonly clsService: ClsService) {}

  intercept(executionContext: ExecutionContext, next: CallHandler) {
    let correlationId: string;

    switch (executionContext.getType<CommonExecutionContext>()) {
      case 'http': {
        const request: Request = executionContext
          .switchToHttp()
          .getRequest();
        const correlationIdValue = Array.isArray(
          request.headers[CORRELATION_ID_HEADER_NAME],
        )
          ? request.headers[CORRELATION_ID_HEADER_NAME][0]
          : request.headers[CORRELATION_ID_HEADER_NAME];

        correlationId = correlationIdValue ?? randomUUID();

        break;
      }
      case 'graphql': {
        const ctx = GqlExecutionContext.create(executionContext);
        const req: Request = ctx.getContext().req;

        correlationId = req.headers[
          CORRELATION_ID_HEADER_NAME
        ] as string;

        break;
      }
      case 'rpc': {
        const { correlationId: correlationIdValue } = executionContext
          .switchToRpc()
          .getContext<{ correlationId?: string }>();

        correlationId = correlationIdValue ?? randomUUID();

        break;
      }
      default:
        throw new Error('Unimplemented request type');
    }

    this.clsService.set(CORRELATION_ID_CLS_KEY, correlationId);

    return next.handle();
  }
}
