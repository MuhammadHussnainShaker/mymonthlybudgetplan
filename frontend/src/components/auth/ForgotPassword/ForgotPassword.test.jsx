import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { sendPasswordResetEmail } from 'firebase/auth'
import ForgotPassword from './ForgotPassword'

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}))

vi.mock('@/services/firebase/firebaseClient', () => ({
  auth: {},
}))

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders forgot password form', () => {
    render(<ForgotPassword />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Reset Email' })).toBeInTheDocument()
  })

  it('allows user to enter email', () => {
    render(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('shows loading state while submitting', async () => {
    sendPasswordResetEmail.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Reset Email' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument()
    })

    expect(submitButton).toBeDisabled()
    expect(emailInput).toBeDisabled()
  })

  it('displays success message after successful submission', async () => {
    sendPasswordResetEmail.mockResolvedValue()

    render(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    const submitButton = screen.getByRole('button', { name: 'Send Reset Email' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Password reset email sent/i)).toBeInTheDocument()
      expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument()
    })
  })

  it('displays error message on failure', async () => {
    const errorMessage = 'Email not found'
    sendPasswordResetEmail.mockRejectedValue(new Error(errorMessage))

    render(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    const submitButton = screen.getByRole('button', { name: 'Send Reset Email' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('displays generic error message when error has no message', async () => {
    sendPasswordResetEmail.mockRejectedValue({})

    render(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    const submitButton = screen.getByRole('button', { name: 'Send Reset Email' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to send reset email')).toBeInTheDocument()
    })
  })

  it('calls sendPasswordResetEmail with correct parameters', async () => {
    sendPasswordResetEmail.mockResolvedValue()

    render(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    const submitButton = screen.getByRole('button', { name: 'Send Reset Email' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        expect.objectContaining({
          url: expect.stringContaining('/login'),
        })
      )
    })
  })

  it('requires email field to be filled', () => {
    render(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    expect(emailInput).toBeRequired()
  })

  it('email input has correct type', () => {
    render(<ForgotPassword />)

    const emailInput = screen.getByLabelText('Email')
    expect(emailInput).toHaveAttribute('type', 'email')
  })
})
