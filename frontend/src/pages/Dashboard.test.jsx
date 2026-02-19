import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

// Mock components
vi.mock('@/components', () => ({
  Incomes: () => <div data-testid="incomes">Incomes Component</div>,
  Savings: () => <div data-testid="savings">Savings Component</div>,
  Container: ({ children }) => <div data-testid="container">{children}</div>,
}))

describe('Dashboard', () => {
  it('renders Incomes component', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('incomes')).toBeInTheDocument()
  })

  it('renders Savings component', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('savings')).toBeInTheDocument()
  })

  it('wraps content in Container component', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('renders both Incomes and Savings inside the same container', () => {
    render(<Dashboard />)
    const container = screen.getByTestId('container')
    expect(container).toContainElement(screen.getByTestId('incomes'))
    expect(container).toContainElement(screen.getByTestId('savings'))
  })
})
