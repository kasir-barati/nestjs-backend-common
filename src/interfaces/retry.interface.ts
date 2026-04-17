// Disjoint union
export type RetryResult<TResult> = [null, TResult] | [Error, null];

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
