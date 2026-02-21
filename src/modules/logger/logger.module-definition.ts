import {
  ConfigurableModuleBuilder,
  ConfigurableModuleOptionsFactory,
  LogLevel,
} from '@nestjs/common';

import { LogMode } from './logger.interface';

export interface ExtraLoggerModuleOptions {
  global?: boolean;
}
export interface LoggerModuleOptions {
  logMode: LogMode;
  logLevel: LogLevel;
}
export type RegisterLoggerModuleOptions = LoggerModuleOptions &
  ExtraLoggerModuleOptions;

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<LoggerModuleOptions>()
  .setClassMethodName('register')
  .setExtras<ExtraLoggerModuleOptions>(
    { global: false },
    (definition, extras) => ({
      ...definition,
      global: extras.global,
    }),
  )
  .setFactoryMethodName('create')
  .build();
export type LoggerModuleOptionsFactory =
  ConfigurableModuleOptionsFactory<LoggerModuleOptions, 'create'>;
