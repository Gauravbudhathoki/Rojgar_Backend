module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/_test_/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
      },
    }],
  },
  testTimeout: 30000,
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/src/integration/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid)/)',
  ],
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
  setupFiles: ['dotenv/config'],
};