import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    clearMocks: true,
    restoreMocks: true,
    threads: false,
    hookTimeout: 120000,
  },
})
