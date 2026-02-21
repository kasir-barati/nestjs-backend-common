import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';

import { CorrelationIdInterceptor } from './correlation-id.interceptor';
import { CorrelationIdModuleOptions } from './correlation-id.interface';
import { CorrelationIdService } from './correlation-id.service';

/**
 * @description
 * To use the `CorrelationIdModule` in your application you need to have the [nestjs-cls](https://www.npmjs.com/package/nestjs-cls) and [@nestjs/graphql](https://www.npmjs.com/package/@nestjs/graphql) packages installed.
 *
 * @example
 * ```ts
 * CorrelationIdModule.forRoot({
 *   global: true,
 * })
 * ```
 */
@Module({})
export class CorrelationIdModule {
  static forRoot(
    options?: CorrelationIdModuleOptions,
  ): DynamicModule {
    return {
      global: options?.global ?? false,
      module: CorrelationIdModule,
      imports: [ClsModule],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: CorrelationIdInterceptor,
        },
        CorrelationIdService,
      ],
      exports: [CorrelationIdService],
    };
  }
}
