import {
  RetryCallback,
  RetryOptions,
  RetryResult,
} from '../interfaces';

/**
 * @description
 * It tries to call the given synchronous `func` with the given options. Unlike {@link retryAsync}, this handles functions that throw synchronous errors (e.g., `JSON.parse('invalid')`).
 *
 * This function is fully synchronous and does not support delays between retries. If you need delay/backoff support, use {@link retryAsync} instead. The returned value is analogous to the error handling mechanism in Golang.
 *
 * @example
 * ```ts
 * const [error, result] = retry(
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
  options?: Omit<RetryOptions, 'delay'>,
): RetryResult<TResult> {
  let index = 0;
  let error: unknown;
  let { retry: retryCount = Number.POSITIVE_INFINITY } =
    options ?? {};
  const start = Date.now();
  const retryStatus = () => ({
    index,
    duration: Date.now() - start,
    error: error,
  });

  while (true) {
    try {
      const result = func(retryStatus());

      return [null, result];
    } catch (caughtException) {
      error = caughtException;

      if (typeof options?.error === 'function') {
        options.error(retryStatus());
      }

      if (
        (typeof retryCount === 'function'
          ? retryCount(retryStatus())
            ? 1
            : 0
          : retryCount--) <= 0
      ) {
        return [error as Error, null];
      }

      index++;
    }
  }
}
