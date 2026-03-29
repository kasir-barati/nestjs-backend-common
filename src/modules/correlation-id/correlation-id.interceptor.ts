import type { Metadata } from '@grpc/grpc-js';
import type { ConsumeMessage } from 'amqplib';
import type { Request, Response } from 'express';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { randomUUID } from 'crypto';
import { ClsService } from 'nestjs-cls';
import { type Observable, tap } from 'rxjs';

import { CommonExecutionContext } from '../../interfaces';
import {
  CORRELATION_ID_CLS_KEY,
  CORRELATION_ID_HEADER_NAME,
} from './correlation-id.constant';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
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
      case 'ws': {
        // TODO: implement correlation id for WebSocket and Socket.IO
        // const client = executionContext.switchToWs().getClient()

        // if (isSocketIo(client)) {
        //   // Socket.IO: headers exist at any time on client.handshake.headers
        //   const fromHeader = client.handshake.headers[headerKey] as string | undefined;
        //   correlationId = client.data.correlationId ?? fromHeader ?? randomUUID();
        //   client.data.correlationId = correlationId; // persist
        // } else if (isWs(client)) {
        //   // ws: headers are only available on the initial upgrade request.
        //   // You should set correlationId during handleConnection (see below).
        //   correlationId = client.correlationId ?? randomUUID();
        //   client.correlationId = correlationId; // persist
        // }

        break;
      }
      case 'rmq': {
        const message: ConsumeMessage = executionContext.getArgs()[0];

        correlationId =
          message?.properties?.headers?.[CORRELATION_ID_HEADER_NAME];

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

    switch (executionContext.getType<CommonExecutionContext>()) {
      case 'http': {
        const req: Request = executionContext
          .switchToHttp()
          .getRequest();

        this.setHttpCorrelationIdHeader(req, correlationId);

        break;
      }
      case 'graphql': {
        const ctx = GqlExecutionContext.create(executionContext);
        const context = ctx.getContext();

        this.setGraphqlCorrelationIdRequestHeader(
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

    return next.handle().pipe(
      tap(() => {
        switch (executionContext.getType<CommonExecutionContext>()) {
          case 'http': {
            const res: Response = executionContext
              .switchToHttp()
              .getResponse();

            res.setHeader(CORRELATION_ID_HEADER_NAME, correlationId);

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

  private setHttpCorrelationIdHeader(
    req: Request,
    correlationId: string,
  ) {
    req.headers[CORRELATION_ID_HEADER_NAME] = correlationId;
  }

  private setGraphqlCorrelationIdRequestHeader(
    context: any,
    correlationId: string,
  ) {
    if (context.req?.headers) {
      context.req.headers[CORRELATION_ID_HEADER_NAME] = correlationId;
      return;
    }

    if (context.req?.extra?.request?.headers) {
      context.req.extra.request.headers[CORRELATION_ID_HEADER_NAME] =
        correlationId;
      return;
    }
  }
}
