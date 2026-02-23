import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import useUserStore from '@/store/useUserStore'
import Login from '@/components/auth/Login/Login'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
}))

vi.mock('@/services/firebase/firebaseClient', () => ({
  auth: { currentUser: null },
}))

vi.mock('@/utils/apiFetch', () => ({
  apiAuthFetch: vi.fn(),
}))

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
    useUserStore.setState({
      firebaseUser: null,
      loading: false,
      user: { isAuthenticated: false, userData: null },
    })
    mockNavigate.mockClear()
  })

  it('renders login form with email and password fields', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('Email *')).toBeInTheDocument()
    expect(screen.getByLabelText('Password *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })
})
