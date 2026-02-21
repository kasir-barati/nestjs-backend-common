import {
  ConfigurableModuleBuilder,
  ConfigurableModuleOptionsFactory,
} from '@nestjs/common';

import { CommonModuleOptions } from '../../interfaces';
import { LogLevel, LogMode } from './logger.interface';

export type ExtraLoggerModuleOptions = CommonModuleOptions;
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
