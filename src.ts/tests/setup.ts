/* eslint-disable no-console */
// Store original console methods
let originalConsoleError: typeof console.error;
let originalConsoleLog: typeof console.log;

beforeAll(() => {
  // Save original console methods
  originalConsoleError = console.error;
  originalConsoleLog = console.log;

  // Replace with jest mocks
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});
