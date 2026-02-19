import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ForgotPasswordPage from './ForgotPassword'

// Mock components
vi.mock('@/components', () => ({
  ForgotPassword: () => <div data-testid="forgot-password-component">Forgot Password Component</div>,
  Container: ({ children }) => <div data-testid="container">{children}</div>,
}))

describe('ForgotPassword Page', () => {
  it('renders ForgotPassword component', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByTestId('forgot-password-component')).toBeInTheDocument()
  })

  it('wraps ForgotPassword component in Container', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('renders ForgotPassword component inside Container', () => {
    render(<ForgotPasswordPage />)
    const container = screen.getByTestId('container')
    expect(container).toContainElement(screen.getByTestId('forgot-password-component'))
  })
})
