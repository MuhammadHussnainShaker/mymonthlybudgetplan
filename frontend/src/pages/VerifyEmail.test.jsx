import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import VerifyEmail from '@/pages/VerifyEmail'

describe('VerifyEmail Page', () => {
  it('renders email verification message', () => {
    render(
      <MemoryRouter>
        <VerifyEmail />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument()
    expect(
      screen.getByText(/we've sent you an email with a verification link/i),
    ).toBeInTheDocument()
  })

  it('provides link to login page', () => {
    render(
      <MemoryRouter>
        <VerifyEmail />
      </MemoryRouter>,
    )

    const loginLink = screen.getByRole('link', { name: /go to login/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('shows instructions about verifying email first', () => {
    render(
      <MemoryRouter>
        <VerifyEmail />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(/once you've verified your email, you can log in/i),
    ).toBeInTheDocument()
  })
})
