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

  it('renders login form with FirebaseUI', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('signin-screen')).toBeInTheDocument()
  })
})
