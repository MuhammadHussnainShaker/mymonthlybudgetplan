import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import VerifyEmail from './VerifyEmail'

describe('VerifyEmail', () => {
  it('renders verify email heading', () => {
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    )

    expect(screen.getByText('Verify Your Email')).toBeInTheDocument()
  })

  it('displays instructions to check inbox', () => {
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    )

    expect(screen.getByText(/We've sent you an email/i)).toBeInTheDocument()
    expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
  })

  it('displays message about logging in after verification', () => {
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    )

    expect(screen.getByText(/Once you've verified your email/i)).toBeInTheDocument()
  })

  it('renders link to login page', () => {
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    )

    const loginLink = screen.getByRole('link', { name: 'Go to Login' })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('applies correct styling to container', () => {
    const { container } = render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    )

    const mainDiv = container.querySelector('div')
    expect(mainDiv).toHaveClass('max-w-md')
    expect(mainDiv).toHaveClass('mx-auto')
    expect(mainDiv).toHaveClass('text-center')
  })
})
