import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export function getHeaderFactory(
  name: string | undefined,
  context: ExecutionContext,
) {
  const ctx = GqlExecutionContext.create(context).getContext();
  const headers = ctx.req.headers as Record<
    string,
    string | string[] | undefined
  >;

  if (!name) {
    return headers;
  }

  return headers[name.toLowerCase()];
}

/**
 * @description
 * Returns request headers, or a specific header when a name is provided. This decorator is intended for GraphQL contexts only.
 */
export const GetHeaders = createParamDecorator(getHeaderFactory);
