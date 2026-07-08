/**
 * Jest configuration for chaptered-api testing.
 * Configures ts-jest preset, node test environment, and matching rules for API tests.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
