import type { Config } from 'jest';

export default {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  setupFilesAfterEnv: ['./jest-setup-after-env.ts'],
} satisfies Config;
