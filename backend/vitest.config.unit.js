import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup-unit.js'],
    clearMocks: true,
    restoreMocks: true,
    threads: false,
    include: [
      'src/tests/ApiError.test.js',
      'src/tests/ApiResponse.test.js',
      'src/tests/asyncHandler.test.js',
      'src/tests/validateAndSanitizeInput.test.js',
      'src/tests/errorhandler.test.js',
      'src/tests/auth.middleware.test.js',
      'src/tests/firebase-auth.middleware.test.js',
    ],
  },
})
