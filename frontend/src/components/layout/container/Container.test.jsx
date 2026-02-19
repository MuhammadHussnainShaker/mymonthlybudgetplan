import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Container from '@/components/layout/container/Container'

describe('Container', () => {
  it('renders children inside wrapper', () => {
    const { container } = render(
      <Container>
        <span>Child Content</span>
      </Container>,
    )

    expect(screen.getByText('Child Content')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('max-w-7xl', 'mx-auto', 'px-4')
  })
})
