/** @description The mode in which logs are outputted */
export type LogMode = 'JSON' | 'PLAIN_TEXT';
/** @description These levels come from [winston](https://github.com/winstonjs/winston?tab=readme-ov-file#logging-levels) */
export type LogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly';
export interface LogMetadata {
  context?: string;
  correlationId?: string;
  [key: string]: any; // Allow extra parameters
}
