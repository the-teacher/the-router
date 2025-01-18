// Store original console methods
let originalConsoleError: typeof console.error;

beforeAll(() => {
  // Save original console methods
  originalConsoleError = console.error;
  // Replace with jest mock
  console.error = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
});
