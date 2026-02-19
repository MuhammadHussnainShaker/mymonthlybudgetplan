import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('firebaseClient', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('initializes Firebase app with config from environment variables', async () => {
    const { initializeApp } = await import('firebase/app')

    // Re-import the module to trigger initialization
    await import('./firebaseClient')

    expect(initializeApp).toHaveBeenCalled()

    const config = initializeApp.mock.calls[0][0]
    expect(config).toBeDefined()
    expect(config).toHaveProperty('apiKey')
    expect(config).toHaveProperty('authDomain')
    expect(config).toHaveProperty('projectId')
  })

  it('exports ui instance from Firebase UI', async () => {
    const module = await import('./firebaseClient')
    expect(module.ui).toBeDefined()
    expect(typeof module.ui).toBe('object')
  })

  it('exports auth instance from Firebase', async () => {
    const module = await import('./firebaseClient')
    expect(module.auth).toBeDefined()
    expect(typeof module.auth).toBe('object')
  })

  it('initializes Firebase analytics', async () => {
    const { getAnalytics } = await import('firebase/analytics')
    await import('./firebaseClient')

    expect(getAnalytics).toHaveBeenCalled()
  })
})
