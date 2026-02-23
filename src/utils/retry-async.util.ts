// Disjoint union
export type RetryAsyncResult<TResult> =
  | [null, TResult]
  | [Error, null];

/**
 * Retry-status object type, for use with RetryCB.
 */
export type RetryStatus = {
  /**
   * Retry index, starting from 0.
   */
  index: number;
  /**
   * Retry overall duration, in milliseconds.
   */
  duration: number;
  /**
   * Last error, if available;
   * it is undefined only when "retryAsync" calls "func" with index = 0.
   */
  error?: unknown;
};

/**
 * Retry-status callback type.
 */
export type RetryCallback<TType> = (s: RetryStatus) => TType;

/**
 * Type for options passed into retryAsync function.
 */
export type RetryOptions = {
  /**
   * @description Maximum number of retries (infinite by default),
   * or a callback to indicate the need for another retry.
   */
  retry?: number | RetryCallback<boolean>;
  /**
   * @description Retry delays, in milliseconds (no delay by default),
   * or a callback that returns the delays.
   */
  delay?: number | RetryCallback<number>;
  /**
   * @description Error notifications.
   */
  error?: RetryCallback<void>;
};

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
): Promise<RetryAsyncResult<TResult>> {
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
  const callbackFunction = (): Promise<RetryAsyncResult<TResult>> => {
    return func(retryStatus())
      .then((result) => [null, result] as RetryAsyncResult<TResult>)
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
