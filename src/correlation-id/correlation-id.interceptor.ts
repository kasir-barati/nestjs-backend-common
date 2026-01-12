import type { Metadata } from '@grpc/grpc-js';
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
import { type Observable, tap } from 'rxjs';

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
  ): Observable<any> {
    let correlationId: string | undefined;

    switch (executionContext.getType<CommonExecutionContext>()) {
      case 'http': {
        const req: Request = executionContext
          .switchToHttp()
          .getRequest();

        correlationId = req.headers[
          CORRELATION_ID_HEADER_NAME
        ] as string;

        break;
      }
      case 'graphql': {
        const ctx = GqlExecutionContext.create(executionContext);
        const context = ctx.getContext();

        if (ctx.getInfo().operation.operation === 'subscription') {
          return next.handle();
        }

        correlationId = this.getGraphqlCorrelationIdHeader(context);

        break;
      }
      case 'rpc': {
        const req = executionContext.switchToRpc();

        correlationId = req
          .getContext<Metadata>()
          .get(CORRELATION_ID_HEADER_NAME)[0] as string;

        break;
      }
    }

    correlationId = correlationId ?? randomUUID();

    if (!this.clsService.isActive()) {
      this.clsService.run(() => {
        this.clsService.set(CORRELATION_ID_CLS_KEY, correlationId);
      });
    } else {
      this.clsService.set(CORRELATION_ID_CLS_KEY, correlationId);
    }

    return next.handle().pipe(
      tap(() => {
        switch (executionContext.getType<CommonExecutionContext>()) {
          case 'http': {
            const res: Response = executionContext
              .switchToHttp()
              .getResponse();

            res.headers.append(
              CORRELATION_ID_HEADER_NAME,
              correlationId,
            );

            break;
          }
          case 'graphql': {
            const ctx = GqlExecutionContext.create(executionContext);
            const context = ctx.getContext();

            this.setGraphqlCorrelationIdHeader(
              context,
              correlationId,
            );

            break;
          }
          case 'rpc': {
            const metadata = executionContext
              .switchToRpc()
              .getContext<Metadata>();

            metadata.set(CORRELATION_ID_HEADER_NAME, correlationId);

            break;
          }
        }
      }),
    );
  }

  private isHttp(context: any): boolean {
    return !!context?.req?.res;
  }

  private isWebSocket(context: any): boolean {
    return !!(
      context?.req?.extra?.request ||
      context?.connection ||
      (context?.req && !context?.res)
    );
  }

  private getGraphqlCorrelationIdHeader(context: any) {
    if (this.isHttp(context)) {
      return context.req.headers[
        CORRELATION_ID_HEADER_NAME
      ] as string;
    }

    if (this.isWebSocket(context)) {
      return context.req.extra.request.headers[
        CORRELATION_ID_HEADER_NAME
      ] as string;
    }
  }

  private setGraphqlCorrelationIdHeader(
    context: any,
    correlationId: string,
  ) {
    if (context.res) {
      context.res.setHeader(
        CORRELATION_ID_HEADER_NAME,
        correlationId,
      );
      return;
    }

    if (context.req && context.req.res) {
      context.req.res.setHeader(
        CORRELATION_ID_HEADER_NAME,
        correlationId,
      );
      return;
    }
  }
}
