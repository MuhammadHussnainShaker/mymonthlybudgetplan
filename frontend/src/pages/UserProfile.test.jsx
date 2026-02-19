import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserProfile from './UserProfile'

// Mock components
vi.mock('@/components', () => ({
  Container: ({ children }) => <div data-testid="container">{children}</div>,
}))

describe('UserProfile', () => {
  it('renders UserProfile page heading', () => {
    render(<UserProfile />)
    expect(screen.getByText('UserProfile Page')).toBeInTheDocument()
  })

  it('wraps content in Container component', () => {
    render(<UserProfile />)
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })

  it('renders heading inside Container', () => {
    render(<UserProfile />)
    const container = screen.getByTestId('container')
    const heading = screen.getByText('UserProfile Page')
    expect(container).toContainElement(heading)
  })
})
