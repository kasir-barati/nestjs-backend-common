import { urlBuilder } from './url-builder';

describe(urlBuilder.name, () => {
  it.each<{ base: string; path: string[]; expected: string }>([
    {
      base: 'https://api.example.com',
      path: ['users', '1'],
      expected: 'https://api.example.com/users/1',
    },
    {
      base: 'https://api.example.com/',
      path: ['/users/', '/1/'],
      expected: 'https://api.example.com/users/1',
    },
    {
      base: 'https://api.example.com/base',
      path: ['users', '', '/1/'],
      expected: 'https://api.example.com/base/users/1',
    },
    {
      base: 'https://api.example.com///',
      path: [],
      expected: 'https://api.example.com/',
    },
    {
      base: 'https://api.example.com/base/',
      path: ['../health'],
      expected: 'https://api.example.com/health',
    },
  ])(
    'should build url from base=$base and path=$path',
    ({ base, path, expected }) => {
      expect(urlBuilder(base, ...path)).toBe(expected);
    },
  );

  it.each([
    '',
    'api.example.com',
    '/relative',
    'http://',
    'https://exa mple.com',
  ])('should throw if base is invalid: "%s"', (base) => {
    expect(() => urlBuilder(base, 'users', '1')).toThrow(
      'Invalid URL',
    );
  });
});
