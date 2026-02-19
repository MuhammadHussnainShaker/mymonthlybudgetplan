import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/Footer/Footer'

describe('Footer', () => {
  it('renders the footer content', () => {
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(
      screen.getByText(/Copyright 2026\. All Rights Reserved by Home Budgeting\./i),
    ).toBeInTheDocument()
  })
})
