import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// Mock firebase-admin before importing the config module
vi.mock('firebase-admin', () => {
  const mockAuth = vi.fn()
  const mockCert = vi.fn((config) => config)
  const mockInitializeApp = vi.fn(() => 'mock-app')

  return {
    default: {
      initializeApp: mockInitializeApp,
      credential: {
        cert: mockCert,
      },
      auth: mockAuth,
    },
  }
})

describe('Firebase Config', () => {
  let admin

  beforeEach(async () => {
    // Reset module registry to get a fresh initializeFirebase each test
    vi.resetModules()
    // Re-mock firebase-admin after resetModules
    vi.doMock('firebase-admin', () => {
      const mockAuth = vi.fn(() => 'mock-auth')
      const mockCert = vi.fn((config) => config)
      const mockInitializeApp = vi.fn(() => 'mock-app')

      return {
        default: {
          initializeApp: mockInitializeApp,
          credential: {
            cert: mockCert,
          },
          auth: mockAuth,
        },
      }
    })
    admin = (await import('firebase-admin')).default
  })

  afterEach(() => {
    delete process.env.FIREBASE_PROJECT_ID
    delete process.env.FIREBASE_CLIENT_EMAIL
    delete process.env.FIREBASE_PRIVATE_KEY
  })

  describe('initializeFirebase', () => {
    it('uses individual env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-project-id'
      process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com'
      process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\ntest-key\\n-----END PRIVATE KEY-----\\n'

      const { initializeFirebase } = await import('../config/firebase.js')
      initializeFirebase()

      expect(admin.credential.cert).toHaveBeenCalledWith({
        projectId: 'test-project-id',
        clientEmail: 'test@test.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
      })
      expect(admin.initializeApp).toHaveBeenCalled()
    })

    it('replaces escaped newlines in FIREBASE_PRIVATE_KEY', async () => {
      process.env.FIREBASE_PROJECT_ID = 'proj'
      process.env.FIREBASE_CLIENT_EMAIL = 'email@test.com'
      process.env.FIREBASE_PRIVATE_KEY = 'line1\\nline2\\nline3'

      const { initializeFirebase } = await import('../config/firebase.js')
      initializeFirebase()

      expect(admin.credential.cert).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey: 'line1\nline2\nline3',
        }),
      )
    })

    it('returns the firebase app on success', async () => {
      process.env.FIREBASE_PROJECT_ID = 'proj'
      process.env.FIREBASE_CLIENT_EMAIL = 'email@test.com'
      process.env.FIREBASE_PRIVATE_KEY = 'key'

      const { initializeFirebase } = await import('../config/firebase.js')
      const result = initializeFirebase()

      expect(result).toBe('mock-app')
    })

    it('returns existing app if already initialized', async () => {
      process.env.FIREBASE_PROJECT_ID = 'proj'
      process.env.FIREBASE_CLIENT_EMAIL = 'email@test.com'
      process.env.FIREBASE_PRIVATE_KEY = 'key'

      const { initializeFirebase } = await import('../config/firebase.js')
      const first = initializeFirebase()
      const second = initializeFirebase()

      expect(first).toBe(second)
      expect(admin.initializeApp).toHaveBeenCalledTimes(1)
    })

    it('returns null and logs error on initialization failure', async () => {
      admin.initializeApp.mockImplementation(() => {
        throw new Error('Init failed')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { initializeFirebase } = await import('../config/firebase.js')
      const result = initializeFirebase()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize Firebase Admin SDK:',
        'Init failed',
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getAuth', () => {
    it('throws if firebase is not initialized', async () => {
      const { getAuth } = await import('../config/firebase.js')

      expect(() => getAuth()).toThrow('Firebase is not initialized')
    })

    it('returns auth instance after initialization', async () => {
      process.env.FIREBASE_PROJECT_ID = 'proj'
      process.env.FIREBASE_CLIENT_EMAIL = 'email@test.com'
      process.env.FIREBASE_PRIVATE_KEY = 'key'

      const { initializeFirebase, getAuth } = await import(
        '../config/firebase.js'
      )
      initializeFirebase()
      const auth = getAuth()

      expect(auth).toBe('mock-auth')
    })
  })
})
