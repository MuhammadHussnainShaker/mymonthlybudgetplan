import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './Home'

// Mock Container component
vi.mock('@/components', () => ({
  Container: ({ children }) => <div data-testid="container">{children}</div>,
}))

describe('Home', () => {
  it('renders home page heading', () => {
    render(<Home />)
    expect(screen.getByText('Home Budgeting')).toBeInTheDocument()
  })

  it('displays description about the platform', () => {
    render(<Home />)
    expect(
      screen.getByText(/Provide a simple platform to plan and track monthly budgets/i)
    ).toBeInTheDocument()
  })

  it('wraps content in Container component', () => {
    render(<Home />)
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('heading has correct styling', () => {
    const { container } = render(<Home />)
    const heading = container.querySelector('h1')
    expect(heading).toHaveClass('text-xl')
    expect(heading).toHaveClass('font-medium')
  })

  it('description has correct styling', () => {
    const { container } = render(<Home />)
    const paragraph = container.querySelector('p')
    expect(paragraph).toHaveClass('max-w-prose')
    expect(paragraph).toHaveClass('text-sm')
    expect(paragraph).toHaveClass('leading-6')
  })
})
