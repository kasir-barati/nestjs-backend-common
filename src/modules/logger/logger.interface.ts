export type LogMode = 'JSON' | 'PLAIN_TEXT';
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
