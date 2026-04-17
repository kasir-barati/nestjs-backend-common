import { retry } from './retry.util';

describe(retry.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('successful execution', () => {
    it('should return result on first successful call', () => {
      const mockFunc = jest.fn().mockReturnValue('success');

      const [error, result] = retry(mockFunc);

      expect(error).toBeNull();
      expect(result).toBe('success');
      expect(mockFunc).toHaveBeenCalledTimes(1);
      expect(mockFunc).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 0,
          duration: expect.any(Number),
          error: undefined,
        }),
      );
    });

    it('should return complex object result', () => {
      const expectedResult = {
        id: 1,
        name: 'test',
        nested: { value: 42 },
      };
      const mockFunc = jest.fn().mockReturnValue(expectedResult);

      const [error, result] = retry(mockFunc);

      expect(error).toBeNull();
      expect(result).toEqual(expectedResult);
    });

    it('should work with array results', () => {
      const expectedResult = [1, 2, 3, 4, 5];
      const mockFunc = jest.fn().mockReturnValue(expectedResult);

      const [error, result] = retry(mockFunc);

      expect(error).toBeNull();
      expect(result).toEqual(expectedResult);
    });

    it('should handle JSON.parse with valid JSON', () => {
      const [error, result] = retry(
        () => JSON.parse('{"key": "value"}'),
        { retry: 0 },
      );

      expect(error).toBeNull();
      expect(result).toEqual({ key: 'value' });
    });
  });

  describe('sync error handling', () => {
    it('should catch sync throw and return error tuple', () => {
      const [error, result] = retry(
        () => JSON.parse('invalid json'),
        { retry: 0 },
      );

      expect(error).toBeInstanceOf(SyntaxError);
      expect(result).toBeNull();
    });

    it('should catch explicit throw and return error tuple', () => {
      const testError = new Error('sync failure');
      const [error, result] = retry(
        () => {
          throw testError;
        },
        { retry: 0 },
      );

      expect(error).toBe(testError);
      expect(result).toBeNull();
    });
  });

  describe('retry mechanism', () => {
    it('should retry on failure and succeed on second attempt', () => {
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First failure');
        }
        return 'success';
      });

      const [error, result] = retry(mockFunc, { retry: 1 });

      expect(error).toBeNull();
      expect(result).toBe('success');
      expect(mockFunc).toHaveBeenCalledTimes(2);
    });

    it('should retry multiple times until success', () => {
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount <= 3) {
          throw new Error(`Failure ${callCount}`);
        }
        return 'success';
      });

      const [error, result] = retry(mockFunc, { retry: 5 });

      expect(error).toBeNull();
      expect(result).toBe('success');
      expect(mockFunc).toHaveBeenCalledTimes(4);
    });

    it('should pass correct retry status on each attempt', () => {
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount <= 2) {
          throw new Error(`Error ${callCount}`);
        }
        return 'success';
      });

      retry(mockFunc, { retry: 3 });

      expect(mockFunc).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          index: 0,
          error: undefined,
        }),
      );
      expect(mockFunc).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          index: 1,
          error: expect.any(Error),
        }),
      );
      expect(mockFunc).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          index: 2,
          error: expect.any(Error),
        }),
      );
    });
  });

  describe('maximum retry limit', () => {
    it('should return error when retry limit is reached', () => {
      const testError = new Error('Persistent failure');
      const mockFunc = jest.fn(() => {
        throw testError;
      });

      const [error, result] = retry(mockFunc, { retry: 2 });

      expect(error).toBe(testError);
      expect(result).toBeNull();
      expect(mockFunc).toHaveBeenCalledTimes(3); // Initial call + 2 retries
    });

    it('should not retry when retry is set to 0', () => {
      const testError = new Error('Failure');
      const mockFunc = jest.fn(() => {
        throw testError;
      });

      const [error, result] = retry(mockFunc, { retry: 0 });

      expect(error).toBe(testError);
      expect(result).toBeNull();
      expect(mockFunc).toHaveBeenCalledTimes(1);
    });

    it('should use infinite retries by default', () => {
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount <= 100) {
          throw new Error(`Failure ${callCount}`);
        }
        return 'success';
      });

      const [error, result] = retry(mockFunc);

      expect(error).toBeNull();
      expect(result).toBe('success');
      expect(mockFunc).toHaveBeenCalledTimes(101);
    });
  });

  describe('retry callback function', () => {
    it('should use callback function to determine if retry should continue', () => {
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount <= 2) {
          throw new Error(`Failure ${callCount}`);
        }
        return 'success';
      });
      const retryCallback = jest.fn().mockReturnValue(true);

      const [error, result] = retry(mockFunc, {
        retry: retryCallback,
      });

      expect(error).toBeNull();
      expect(result).toBe('success');
      expect(retryCallback).toHaveBeenCalledTimes(2);
      expect(retryCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          index: expect.any(Number),
          duration: expect.any(Number),
          error: expect.any(Error),
        }),
      );
    });

    it('should stop retrying when callback returns false', () => {
      const testError = new Error('Failure');
      const mockFunc = jest.fn(() => {
        throw testError;
      });
      const retryCallback = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const [error, result] = retry(mockFunc, {
        retry: retryCallback,
      });

      expect(error).toBe(testError);
      expect(result).toBeNull();
      expect(mockFunc).toHaveBeenCalledTimes(2); // Initial + 1 retry (stopped when callback returned false)
      expect(retryCallback).toHaveBeenCalledTimes(2);
    });

    it('should allow conditional retry based on error type', () => {
      const retriableError = new Error('Retriable');
      const nonRetriableError = new Error('Non-retriable');
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          throw retriableError;
        }
        throw nonRetriableError;
      });
      const retryCallback = jest.fn((status) => {
        return (status.error as Error).message === 'Retriable';
      });

      const [error, result] = retry(mockFunc, {
        retry: retryCallback,
      });

      expect(error).toBe(nonRetriableError);
      expect(result).toBeNull();
      expect(mockFunc).toHaveBeenCalledTimes(2);
    });
  });

  describe('error callback', () => {
    it('should call error callback on each failure', () => {
      const testError = new Error('Test error');
      const mockFunc = jest.fn(() => {
        throw testError;
      });
      const errorCallback = jest.fn();

      retry(mockFunc, { retry: 2, error: errorCallback });

      expect(errorCallback).toHaveBeenCalledTimes(3);
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          index: expect.any(Number),
          duration: expect.any(Number),
          error: testError,
        }),
      );
    });

    it('should not call error callback on success', () => {
      const mockFunc = jest.fn().mockReturnValue('success');
      const errorCallback = jest.fn();

      retry(mockFunc, { error: errorCallback });

      expect(errorCallback).not.toHaveBeenCalled();
    });

    it('should call error callback before retry decision', () => {
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Failure');
        }
        return 'success';
      });
      const errorCallback = jest.fn();
      const retryCallback = jest.fn().mockReturnValue(true);

      retry(mockFunc, {
        retry: retryCallback,
        error: errorCallback,
      });

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(retryCallback).toHaveBeenCalledTimes(1);
    });

    it('should provide error details to error callback', () => {
      const testError = new Error('Custom error message');
      const mockFunc = jest.fn(() => {
        throw testError;
      });
      const errorCallback = jest.fn();

      retry(mockFunc, { retry: 0, error: errorCallback });

      expect(errorCallback).toHaveBeenCalledWith({
        index: 0,
        duration: expect.any(Number),
        error: testError,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle non-Error thrown values', () => {
      const mockFunc = jest.fn(() => {
        throw 'string error';
      });

      const [error, result] = retry(mockFunc, { retry: 0 });

      expect(error).toBe('string error');
      expect(result).toBeNull();
    });

    it('should handle undefined options', () => {
      const mockFunc = jest.fn().mockReturnValue('success');

      const [error, result] = retry(mockFunc);

      expect(error).toBeNull();
      expect(result).toBe('success');
    });

    it('should handle empty options object', () => {
      const mockFunc = jest.fn().mockReturnValue('success');

      const [error, result] = retry(mockFunc, {});

      expect(error).toBeNull();
      expect(result).toBe('success');
    });

    it('should handle function that returns null', () => {
      const mockFunc = jest.fn().mockReturnValue(null);

      const [error, result] = retry(mockFunc);

      expect(error).toBeNull();
      expect(result).toBeNull();
    });

    it('should handle function that returns undefined', () => {
      const mockFunc = jest.fn().mockReturnValue(undefined);

      const [error, result] = retry(mockFunc);

      expect(error).toBeNull();
      expect(result).toBeUndefined();
    });

    it('should handle callback function that accesses retry status', () => {
      const statuses: any[] = [];
      const mockFunc = jest.fn((status) => {
        statuses.push({ ...status });
        if (status.index < 2) {
          throw new Error(`Failure ${status.index}`);
        }
        return 'success';
      });

      retry(mockFunc, { retry: 5 });

      expect(statuses).toHaveLength(3);
      expect(statuses[0].index).toBe(0);
      expect(statuses[1].index).toBe(1);
      expect(statuses[2].index).toBe(2);
    });
  });

  describe('combined options', () => {
    it('should work with retry callback and error callback combined', () => {
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount <= 2) {
          throw new Error(`Failure ${callCount}`);
        }
        return 'success';
      });

      const retryCallback = jest.fn().mockReturnValue(true);
      const errorCallback = jest.fn();

      const [error, result] = retry(mockFunc, {
        retry: retryCallback,
        error: errorCallback,
      });

      expect(error).toBeNull();
      expect(result).toBe('success');
      expect(mockFunc).toHaveBeenCalledTimes(3);
      expect(retryCallback).toHaveBeenCalledTimes(2);
      expect(errorCallback).toHaveBeenCalledTimes(2);
    });

    it('should handle complex retry logic with callbacks', () => {
      let callCount = 0;
      const mockFunc = jest.fn(() => {
        callCount++;
        if (callCount <= 2) {
          throw new Error('Retriable');
        }
        throw new Error('Fatal');
      });
      const retryCallback = jest.fn((status) => {
        const error = status.error as Error;
        return status.index < 5 && error?.message !== 'Fatal';
      });
      const errorCallback = jest.fn();

      const [error, result] = retry(mockFunc, {
        retry: retryCallback,
        error: errorCallback,
      });

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Fatal');
      expect(result).toBeNull();
      expect(errorCallback).toHaveBeenCalledTimes(3);
    });
  });
});
