import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import useUserStore from '@/store/useUserStore'
import Signup from '@/components/auth/Signup/Signup'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Signup', () => {
  beforeEach(() => {
    localStorage.clear()
    useUserStore.setState({
      firebaseUser: null,
      loading: false,
      user: { isAuthenticated: false, userData: null },
    })
    mockNavigate.mockClear()
  })

  it('renders signup form', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })
})
