import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DailyExpenses from './DailyExpenses'

// Mock components
vi.mock('@/components', () => ({
  DailyExpenses: () => <div data-testid="daily-expenses">Daily Expenses Component</div>,
  Container: ({ children }) => <div data-testid="container">{children}</div>,
}))

describe('DailyExpenses Page', () => {
  it('renders DailyExpenses component', () => {
    render(<DailyExpenses />)
    expect(screen.getByTestId('daily-expenses')).toBeInTheDocument()
  })

  it('wraps content in Container component', () => {
    render(<DailyExpenses />)
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('renders DailyExpenses component inside Container', () => {
    render(<DailyExpenses />)
    const container = screen.getByTestId('container')
    expect(container).toContainElement(screen.getByTestId('daily-expenses'))
  })
})
