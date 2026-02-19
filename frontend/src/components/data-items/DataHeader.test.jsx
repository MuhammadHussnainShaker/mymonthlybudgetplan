import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DataHeader from '@/components/data-items/DataHeader'

describe('DataHeader', () => {
  it('renders default columns without selectable', () => {
    const { container } = render(<DataHeader />)

    expect(screen.getByText('Section')).toBeInTheDocument()
    expect(screen.queryByText('Selectable')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveClass(
      'grid-cols-[3rem_1fr_8rem_8rem_8rem]',
    )
  })

  it('renders with custom section name and class', () => {
    const { container } = render(
      <DataHeader sectionName='Housing' className='custom' />,
    )

    expect(screen.getByText('Housing')).toBeInTheDocument()
    expect(screen.queryByText('Selectable')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveClass(
      'grid-cols-[3rem_1fr_8rem_8rem_8rem]',
      'custom',
    )
  })
})
