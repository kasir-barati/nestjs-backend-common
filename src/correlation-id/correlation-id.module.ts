import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';

import { CorrelationIdInterceptor } from './correlation-id.interceptor';
import { CorrelationIdService } from './correlation-id.service';
import { CorrelationIdModuleOptions } from './correlation-id.type';

@Module({})
export class CorrelationIdModule {
  forRoot(options?: CorrelationIdModuleOptions): DynamicModule {
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
