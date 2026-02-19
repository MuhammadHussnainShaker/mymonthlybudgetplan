// filepath: vitest.config.docker.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup-docker.js'],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 30000,

    // IMPORTANT: docker setup uses a fixed port (27018) and global container.
    // Run in a single worker to avoid "port already allocated" race conditions.
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 1,
        minThreads: 1,
      },
    },
    fileParallelism: false,
  },
})
