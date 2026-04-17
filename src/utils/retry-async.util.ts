import {
  RetryCallback,
  RetryOptions,
  RetryResult,
} from '../interfaces';

/**
 * @description
 * It tries to call the given function "func" with the given options.
 *
 * The returned value is analogous to the error handling mechanism in the Golang.
 *
 * @example
 * ```ts
 * const [error, result] = await retryAsync(
 *   () => fetch('https://example.com/data'),
 *   {
 *     retry: 3,
 *     delay: 1000,
 *   }
 * );
 * if (error) {
 *   throw error;
 * }
 * console.log(result);
 * ```
 */
export function retryAsync<TResult>(
  func: RetryCallback<Promise<TResult>>,
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
  const callbackFunction = (): Promise<RetryResult<TResult>> => {
    return func(retryStatus())
      .then((result) => [null, result] as RetryResult<TResult>)
      .catch((caughtException) => {
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
          return Promise.resolve([error as Error, null]);
        }

        const milliseconds =
          typeof delay === 'function' ? delay(retryStatus()) : delay;

        index++;

        if (milliseconds >= 0) {
          return new Promise((resolve) =>
            setTimeout(resolve, milliseconds),
          ).then(callbackFunction);
        }

        return callbackFunction();
      });
  };

  return callbackFunction();
}
