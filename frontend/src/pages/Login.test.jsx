import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from './Login'

// Mock Login component
vi.mock('@/components', () => ({
  Login: () => <div data-testid="login-component">Login Component</div>,
}))

describe('Login Page', () => {
  it('renders Login component', () => {
    render(<Login />)
    expect(screen.getByTestId('login-component')).toBeInTheDocument()
  })

  it('wraps Login component in a div', () => {
    const { container } = render(<Login />)
    const wrapper = container.querySelector('div')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toContainElement(screen.getByTestId('login-component'))
  })
})
