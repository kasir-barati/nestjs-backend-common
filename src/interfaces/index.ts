import { ContextType } from '@nestjs/common';

export * from './retry.interface';
export type CommonExecutionContext = 'graphql' | 'rmq' | ContextType;
export type NodeEnv = 'development' | 'production' | 'test';
export interface Class<T> {
  new (...args: any[]): T;
}
export type RecursivePartial<T> = Partial<{
  [key in keyof T]: T[key] extends (...a: Array<infer U>) => unknown
    ? (
        ...a: Array<U>
      ) => RecursivePartial<ReturnType<T[key]>> | ReturnType<T[key]> // tslint:disable-line
    : T[key] extends Array<unknown>
      ? Array<RecursivePartial<T[key][number]>>
      : RecursivePartial<T[key]> | T[key];
}>;
export interface CommonModuleOptions {
  global?: boolean;
}
