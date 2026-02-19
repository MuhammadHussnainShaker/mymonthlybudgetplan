import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  it('renders error message when message is provided', () => {
    render(<ErrorMessage message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    const { container } = render(<ErrorMessage message="Error text" />)
    const errorElement = container.querySelector('p')

    expect(errorElement).toHaveClass('text-red-500')
    expect(errorElement).toHaveClass('text-sm')
  })

  it('returns null when message is not provided', () => {
    const { container } = render(<ErrorMessage message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when message is null', () => {
    const { container } = render(<ErrorMessage message={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when message is undefined', () => {
    const { container } = render(<ErrorMessage />)
    expect(container.firstChild).toBeNull()
  })

  it('renders multiline error messages', () => {
    const multilineMessage = 'Error line 1\nError line 2\nError line 3'
    const { container } = render(<ErrorMessage message={multilineMessage} />)
    const errorElement = container.querySelector('p')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement?.textContent).toBe(multilineMessage)
  })

  it('renders special characters in error message', () => {
    const specialMessage = 'Error: <>&"\'`'
    render(<ErrorMessage message={specialMessage} />)
    expect(screen.getByText(specialMessage)).toBeInTheDocument()
  })

  it('handles very long error messages', () => {
    const longMessage = 'A'.repeat(500)
    render(<ErrorMessage message={longMessage} />)
    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })
})
