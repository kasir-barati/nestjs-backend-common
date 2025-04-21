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
import { Observable } from 'rxjs';

import { CommonExecutionContext } from '../types';
import {
  CORRELATION_ID_CLS_KEY,
  CORRELATION_ID_HEADER_NAME,
} from './correlation-id.constant';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  private logger = new Logger(CorrelationIdInterceptor.name);

  constructor(private readonly clsService: ClsService) {}

  intercept(
    executionContext: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    let correlationId: string;

    switch (executionContext.getType<CommonExecutionContext>()) {
      case 'http': {
        const request: Request = executionContext
          .switchToHttp()
          .getRequest();
        const correlationIdHeader =
          request.headers[CORRELATION_ID_HEADER_NAME];
        const correlationIdValue = Array.isArray(correlationIdHeader)
          ? correlationIdHeader[0]
          : correlationIdHeader;

        correlationId = correlationIdValue ?? randomUUID();

        break;
      }
      case 'graphql': {
        const ctx = GqlExecutionContext.create(executionContext);
        const request: Request = ctx.getContext().req;
        const correlationIdHeader =
          request.headers[CORRELATION_ID_HEADER_NAME];
        const correlationIdValue = Array.isArray(correlationIdHeader)
          ? correlationIdHeader[0]
          : correlationIdHeader;

        correlationId = correlationIdValue ?? randomUUID();

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
