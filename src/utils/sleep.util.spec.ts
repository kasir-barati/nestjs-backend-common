import { StringValue } from 'ms';

import { sleep } from './sleep.util';

describe(sleep.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each<{ time: StringValue; milliseconds: number }>([
    { time: '500ms', milliseconds: 500 },
    { time: '1s', milliseconds: 1000 },
    { time: '2s', milliseconds: 2000 },
    { time: '1m', milliseconds: 60000 },
  ])(
    'should resolve after the specified time: $time',
    async ({ time, milliseconds }) => {
      // Act
      const promise = sleep(time);
      jest.advanceTimersByTime(milliseconds);

      // Assert
      await expect(promise).resolves.toBeUndefined();
    },
  );

  it('should not resolve before the specified time', async () => {
    // Act
    const promise = sleep('1s');
    let resolved = false;
    void promise.then(() => {
      resolved = true;
    });
    jest.advanceTimersByTime(999);
    await Promise.resolve(); // Flush microtasks

    // Assert
    expect(resolved).toBe(false);
    jest.advanceTimersByTime(1);
    await expect(promise).resolves.toBeUndefined();
  });
});
