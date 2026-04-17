import {
  RetryCallback,
  RetryOptions,
  RetryResult,
} from '../interfaces';

/**
 * @description
 * It tries to call the given synchronous `func` with the given options. Unlike {@link retryAsync}, this handles functions that throw synchronous errors (e.g., `JSON.parse('invalid')`).
 *
 * The returned value is analogous to the error handling mechanism in Golang.
 *
 * @example
 * ```ts
 * const [error, result] = await retry(
 *   () => JSON.parse('{"valid": true}'),
 *   { retry: 3 },
 * );
 * if (error) {
 *   throw error;
 * }
 * console.log(result);
 * ```
 */
export function retry<TResult>(
  func: RetryCallback<TResult>,
  options?: RetryOptions,
): Promise<RetryResult<TResult>> {
  let index = 0;
  let error: unknown;
  let { retry = Number.POSITIVE_INFINITY } = options ?? {};
  const start = Date.now();
  const delay = options?.delay ?? -1;
  const retryStatus = () => ({
    index,
    duration: Date.now() - start,
    error: error,
  });
  const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const callbackFunction = async (): Promise<
    RetryResult<TResult>
  > => {
    try {
      const result = func(retryStatus());

      return [null, result];
    } catch (caughtException) {
      error = caughtException;

      if (typeof options?.error === 'function') {
        options?.error(retryStatus());
      }

      if (
        (typeof retry === 'function'
          ? retry(retryStatus())
            ? 1
            : 0
          : retry--) <= 0
      ) {
        return [error as Error, null];
      }

      const milliseconds =
        typeof delay === 'function' ? delay(retryStatus()) : delay;

      index++;

      if (milliseconds >= 0) {
        await sleep(milliseconds);
      }

      return callbackFunction();
    }
  };

  return callbackFunction();
}
