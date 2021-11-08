import type {Config} from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
  return {
    'verbose': true,
    'clearMocks': true,
    'collectCoverage': true,
    'coverageDirectory': 'tests__coverages',
    'maxConcurrency': 2,
    'watchPathIgnorePatterns': [
      './node_modules/',
      './lib/',
    ],
    'testEnvironment': 'node',
    'testMatch': [
      '**/tests/**/*.+(ts)',
    ],
    'transform': {
      '^.+\\.(ts)$': 'ts-jest',
    },
  };
};
