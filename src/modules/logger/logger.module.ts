import { DynamicModule, Module } from '@nestjs/common';
import {
  utilities as nestWinstonModuleUtilities,
  WINSTON_MODULE_NEST_PROVIDER,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';

import { correlationIdFormat } from './correlation-id.format';
import { CustomLoggerService } from './custom-logger.service';
import { jsonFormat } from './json-format';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  LoggerModuleOptions,
  MODULE_OPTIONS_TOKEN,
  RegisterLoggerModuleOptions,
} from './logger.module-definition';
import { nestLikeWithDashFormat } from './nest-like-with-dash.format';

/**
 * @description a custom logger module enabling structured logging. It supports both JSON and plain text formats. My recommendation is to register it globally once and inject it everywhere!
 *
 * @example
 * ```ts
 * class LoggerModuleConfig implements LoggerModuleOptionsFactory {
 *   constructor(private readonly configService: ConfigService) {}
 *   create() {
 *     return {
 *       logMode: this.configService.get<LogMode>('LOG_MODE', 'PLAIN_TEXT'),
 *       logLevel: this.configService.get<LogLevel>('LOG_LEVEL', 'verbose'),
 *     };
 *   }
 * }
 * LoggerModule.registerAsync({
 *   global: true,
 *   inject: [ConfigService],
 *   useClass: LoggerModuleConfig,
 * })
 * // Or you can utilize `useFactory`:
 * LoggerModule.registerAsync({
 *   global: true,
 *   inject: [ConfigService],
 *   useFactory: (configService: ConfigService) => ({
 *     logMode: configService.get<LogMode>('LOG_MODE', 'PLAIN_TEXT'),
 *     logLevel: configService.get<LogLevel>('LOG_LEVEL', 'verbose'),
 *   }),
 * })
 * // Or simply:
 * LoggerModule.register({
 *   global: true,
 *   logMode: 'PLAIN_TEXT',
 *   logLevel: 'verbose',
 * })
 * // And to use it in a service app.service.ts
 * @Injectable()
 * export class AppService {
 *   constructor(private readonly logger: CustomLoggerService) {}
 *   helloWorld() {
 *     this.logger.verbose('Hello, world!', { context: AppService.name });
 *   }
 * }
 * ```
 */
@Module({
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggerModule extends ConfigurableModuleClass {
  static override register(
    options: RegisterLoggerModuleOptions,
  ): DynamicModule {
    const baseModule = super.register(options);
    const isJsonMode = options.logMode === 'JSON';

    return {
      ...baseModule,
      imports: [
        WinstonModule.forRoot({
          level: options.logLevel,
          transports: [
            new winston.transports.Console({
              format: isJsonMode
                ? jsonFormat
                : winston.format.combine(
                    winston.format.timestamp(),
                    nestLikeWithDashFormat, // Add " - " before timestamp
                    winston.format.ms(),
                    correlationIdFormat, // Process correlationId before nestLike
                    winston.format.errors({ stack: true }),
                    nestWinstonModuleUtilities.format.nestLike(
                      'Nest',
                      {
                        colors: true,
                        prettyPrint: true,
                      },
                    ),
                  ),
            }),
          ],
        }),
      ],
      providers: [...(baseModule.providers || [])],
    };
  }

  static override registerAsync(
    options: typeof ASYNC_OPTIONS_TYPE,
  ): DynamicModule {
    const baseModule = super.registerAsync(options);

    const winstonLoggerProvider = {
      provide: WINSTON_MODULE_NEST_PROVIDER,
      useFactory: (loggerOptions: LoggerModuleOptions) => {
        const isJsonMode = loggerOptions.logMode === 'JSON';

        return winston.createLogger({
          level: loggerOptions.logLevel,
          transports: [
            new winston.transports.Console({
              format: isJsonMode
                ? jsonFormat
                : winston.format.combine(
                    winston.format.timestamp(),
                    nestLikeWithDashFormat,
                    winston.format.ms(),
                    correlationIdFormat,
                    winston.format.errors({ stack: true }),
                    nestWinstonModuleUtilities.format.nestLike(
                      'Nest',
                      {
                        colors: true,
                        prettyPrint: true,
                      },
                    ),
                  ),
            }),
          ],
        });
      },
      inject: [MODULE_OPTIONS_TOKEN],
    };

    return {
      ...baseModule,
      module: LoggerModule,
      providers: [
        ...(baseModule.providers || []),
        winstonLoggerProvider,
      ],
      exports: [
        ...(baseModule.exports || []),
        WINSTON_MODULE_NEST_PROVIDER,
      ],
    };
  }
}
