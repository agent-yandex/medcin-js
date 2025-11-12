module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
    '!src/scripts/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: false, // Minimal output
  silent: true, // Suppress console output from tests
  maxWorkers: 1, // Run tests sequentially to avoid DB conflicts
  forceExit: true, // Force exit after tests complete
  detectOpenHandles: false // Suppress open handles warning
};

