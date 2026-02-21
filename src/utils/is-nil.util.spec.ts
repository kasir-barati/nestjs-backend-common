import { isNil } from './is-nil.util';

describe(isNil.name, () => {
  it.each([null, undefined])(
    'should return true for nil value: %p',
    (value) => {
      expect(isNil(value)).toBe(true);
    },
  );

  it.each([
    0,
    '',
    false,
    NaN,
    {},
    [],
    'null',
    'undefined',
    Symbol('symbol'),
    42,
  ])('should return false for non-nil value: %p', (value) => {
    expect(isNil(value)).toBe(false);
  });
});
