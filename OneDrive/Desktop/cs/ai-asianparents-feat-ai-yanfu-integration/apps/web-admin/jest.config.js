const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
    '^@lib-supabase/(.*)$': '<rootDir>/../../packages/lib-supabase/src/$1'
  }
};

module.exports = createJestConfig(customJestConfig);
