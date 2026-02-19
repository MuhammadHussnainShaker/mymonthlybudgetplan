import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Signup from './Signup'

// Mock components
vi.mock('@/components', () => ({
  Signup: () => <div data-testid="signup-component">Signup Component</div>,
  Container: ({ children }) => <div data-testid="container">{children}</div>,
}))

describe('Signup Page', () => {
  it('renders Signup component', () => {
    render(<Signup />)
    expect(screen.getByTestId('signup-component')).toBeInTheDocument()
  })

  it('wraps Signup component in Container', () => {
    render(<Signup />)
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('renders Signup component inside Container', () => {
    render(<Signup />)
    const container = screen.getByTestId('container')
    expect(container).toContainElement(screen.getByTestId('signup-component'))
  })
})
