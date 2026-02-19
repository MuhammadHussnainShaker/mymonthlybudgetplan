import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MonthlyExpenses from './MonthlyExpenses'

// Mock components
vi.mock('@/components', () => ({
  MonthlyExpenses: () => <div data-testid="monthly-expenses">Monthly Expenses Component</div>,
  Container: ({ children }) => <div data-testid="container">{children}</div>,
}))

describe('MonthlyExpenses Page', () => {
  it('renders MonthlyExpenses component', () => {
    render(<MonthlyExpenses />)
    expect(screen.getByTestId('monthly-expenses')).toBeInTheDocument()
  })

  it('wraps content in Container component', () => {
    render(<MonthlyExpenses />)
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('renders MonthlyExpenses component inside Container', () => {
    render(<MonthlyExpenses />)
    const container = screen.getByTestId('container')
    expect(container).toContainElement(screen.getByTestId('monthly-expenses'))
  })
})
