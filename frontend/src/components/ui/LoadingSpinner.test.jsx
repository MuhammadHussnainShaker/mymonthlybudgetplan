import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders spinner with default positioning', () => {
    const { container } = render(<LoadingSpinner />)
    const outerDiv = container.querySelector('div')

    expect(outerDiv).toBeInTheDocument()
    expect(outerDiv).toHaveClass('absolute')
    expect(outerDiv).toHaveClass('right-2')
    expect(outerDiv).toHaveClass('top-1/2')
    expect(outerDiv).toHaveClass('-translate-y-1/2')
  })

  it('renders inner spinner element', () => {
    const { container } = render(<LoadingSpinner />)
    const allDivs = container.querySelectorAll('div')

    // Should have 2 divs: outer wrapper and inner spinner
    expect(allDivs.length).toBeGreaterThanOrEqual(2)
  })

  it('accepts and applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />)
    const spinner = container.querySelector('div')

    expect(spinner).toHaveClass('custom-class')
    expect(spinner).toHaveClass('absolute') // Still has default classes
  })

  it('merges custom className with default classes', () => {
    const { container } = render(<LoadingSpinner className="ml-4 bg-blue-500" />)
    const spinner = container.querySelector('div')

    expect(spinner).toHaveClass('ml-4')
    expect(spinner).toHaveClass('bg-blue-500')
    expect(spinner).toHaveClass('absolute')
    expect(spinner).toHaveClass('right-2')
  })

  it('handles empty className prop', () => {
    const { container } = render(<LoadingSpinner className="" />)
    const spinner = container.querySelector('div')

    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('absolute')
  })

  it('renders without crashing when no props provided', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
