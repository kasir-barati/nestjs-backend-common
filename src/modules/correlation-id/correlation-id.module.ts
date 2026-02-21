import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';

import { CorrelationIdInterceptor } from './correlation-id.interceptor';
import { CorrelationIdModuleOptions } from './correlation-id.interface';
import { CorrelationIdService } from './correlation-id.service';

@Module({})
export class CorrelationIdModule {
  static forRoot(
    options?: CorrelationIdModuleOptions,
  ): DynamicModule {
    return {
      global: options?.isGlobal ?? false,
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
