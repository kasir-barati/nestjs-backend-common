import ms, { StringValue } from 'ms';

/**
 * @description Sleep for a specified amount of time.
 * Look at https://www.npmjs.com/package/ms for more information about the time format.
 */
export function sleep(time: StringValue) {
  const milliseconds = ms(time);

  return new Promise<void>((resolve) =>
    setTimeout(resolve, milliseconds),
  );
}
