import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    signOut: vi.fn(),
  })),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Call callback immediately with null user for tests
    callback(null)
    return vi.fn() // Return unsubscribe function
  }),
  EmailAuthProvider: {
    PROVIDER_ID: 'password',
    EMAIL_PASSWORD_SIGN_IN_METHOD: 'password',
  },
  sendEmailVerification: vi.fn(() => Promise.resolve()),
}))

vi.mock('@firebase-oss/ui-core', () => ({
  initializeUI: vi.fn(() => ({})),
}))

vi.mock('@firebase-oss/ui-react', () => ({
  FirebaseUIProvider: ({ children }) => children,
  SignUpAuthScreen: ({ onSignUp }) => (
    <div data-testid="signup-screen">SignUp Screen</div>
  ),
  SignInAuthScreen: ({ onSignIn }) => (
    <div data-testid="signin-screen">SignIn Screen</div>
  ),
}))

