import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RenderMonthlyExpenseItems from './RenderMonthlyExpenseItems'

describe('RenderMonthlyExpenseItems', () => {
  const mockToggleSelectable = vi.fn()
  const mockDelete = vi.fn()
  const mockUpdate = vi.fn()
  const mockCreate = vi.fn()

  it('renders no categories message when parentCategories is empty', () => {
    const totals = { byParent: {}, grand: {} }

    render(
      <RenderMonthlyExpenseItems
        parentCategories={[]}
        monthlyCatExpenses={[]}
        totals={totals}
        toggleSelectableFn={mockToggleSelectable}
        deleteMonthlyCategoricalExpense={mockDelete}
        updateMonthlyCategoricalExpense={mockUpdate}
        createMonthlyCategoricalExpenses={mockCreate}
      />,
    )

    expect(screen.getByText('No categories available.')).toBeInTheDocument()
  })

  it('renders parent category with expenses', () => {
    const parentCategories = [{ _id: 'p1', description: 'Housing' }]
    const monthlyCatExpenses = [
      {
        _id: 'm1',
        parentId: 'p1',
        description: 'Rent',
        projectedAmount: 1000,
        actualAmount: 900,
        selectable: false,
      },
    ]
    const totals = {
      byParent: {
        p1: { projectedTotal: 1000, actualTotal: 900, difference: 100 },
      },
      grand: {},
    }

    render(
      <RenderMonthlyExpenseItems
        parentCategories={parentCategories}
        monthlyCatExpenses={monthlyCatExpenses}
        totals={totals}
        toggleSelectableFn={mockToggleSelectable}
        deleteMonthlyCategoricalExpense={mockDelete}
        updateMonthlyCategoricalExpense={mockUpdate}
        createMonthlyCategoricalExpenses={mockCreate}
      />,
    )

    expect(screen.getByDisplayValue('Housing')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Rent')).toBeInTheDocument()
    expect(screen.getByText('Projected: 1000')).toBeInTheDocument()
    expect(screen.getByText('Actual: 900')).toBeInTheDocument()
    expect(screen.getByText('Difference: 100')).toBeInTheDocument()
    // Verify selectable checkbox is NOT rendered in the UI
    expect(screen.queryByRole('checkbox', { name: /selectable/i })).not.toBeInTheDocument()
  })

  it('renders no expenses message when category has no expenses', () => {
    const parentCategories = [{ _id: 'p2', description: 'Transport' }]
    const monthlyCatExpenses = []
    const totals = {
      byParent: {
        p2: { projectedTotal: 0, actualTotal: 0, difference: 0 },
      },
      grand: {},
    }

    render(
      <RenderMonthlyExpenseItems
        parentCategories={parentCategories}
        monthlyCatExpenses={monthlyCatExpenses}
        totals={totals}
        toggleSelectableFn={mockToggleSelectable}
        deleteMonthlyCategoricalExpense={mockDelete}
        updateMonthlyCategoricalExpense={mockUpdate}
        createMonthlyCategoricalExpenses={mockCreate}
      />,
    )

    expect(screen.getByDisplayValue('Transport')).toBeInTheDocument()
    expect(
      screen.getByText('No expenses recorded for this category.'),
    ).toBeInTheDocument()
  })

  it('renders multiple parent categories with their expenses', () => {
    const parentCategories = [
      { _id: 'p1', description: 'Housing' },
      { _id: 'p2', description: 'Transport' },
    ]
    const monthlyCatExpenses = [
      {
        _id: 'm1',
        parentId: 'p1',
        description: 'Rent',
        projectedAmount: 1000,
        actualAmount: 900,
        selectable: false,
      },
      {
        _id: 'm2',
        parentId: 'p2',
        description: 'Fuel',
        projectedAmount: 200,
        actualAmount: 180,
        selectable: true,
      },
    ]
    const totals = {
      byParent: {
        p1: { projectedTotal: 1000, actualTotal: 900, difference: 100 },
        p2: { projectedTotal: 200, actualTotal: 180, difference: 20 },
      },
      grand: {},
    }

    render(
      <RenderMonthlyExpenseItems
        parentCategories={parentCategories}
        monthlyCatExpenses={monthlyCatExpenses}
        totals={totals}
        toggleSelectableFn={mockToggleSelectable}
        deleteMonthlyCategoricalExpense={mockDelete}
        updateMonthlyCategoricalExpense={mockUpdate}
        createMonthlyCategoricalExpenses={mockCreate}
      />,
    )

    expect(screen.getByDisplayValue('Housing')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Transport')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Rent')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Fuel')).toBeInTheDocument()
    // Verify selectable checkbox is NOT rendered in the UI
    expect(screen.queryByRole('checkbox', { name: /selectable/i })).not.toBeInTheDocument()
  })

  it('filters expenses correctly by parentId', () => {
    const parentCategories = [
      { _id: 'p1', description: 'Housing' },
      { _id: 'p2', description: 'Transport' },
    ]
    const monthlyCatExpenses = [
      {
        _id: 'm1',
        parentId: 'p1',
        description: 'Rent',
        projectedAmount: 1000,
        actualAmount: 900,
        selectable: false,
      },
      {
        _id: 'm2',
        parentId: 'p1',
        description: 'Utilities',
        projectedAmount: 200,
        actualAmount: 180,
        selectable: false,
      },
      {
        _id: 'm3',
        parentId: 'p2',
        description: 'Fuel',
        projectedAmount: 150,
        actualAmount: 140,
        selectable: true,
      },
    ]
    const totals = {
      byParent: {
        p1: { projectedTotal: 1200, actualTotal: 1080, difference: 120 },
        p2: { projectedTotal: 150, actualTotal: 140, difference: 10 },
      },
      grand: {},
    }

    render(
      <RenderMonthlyExpenseItems
        parentCategories={parentCategories}
        monthlyCatExpenses={monthlyCatExpenses}
        totals={totals}
        toggleSelectableFn={mockToggleSelectable}
        deleteMonthlyCategoricalExpense={mockDelete}
        updateMonthlyCategoricalExpense={mockUpdate}
        createMonthlyCategoricalExpenses={mockCreate}
      />,
    )

    expect(screen.getByDisplayValue('Rent')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Utilities')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Fuel')).toBeInTheDocument()
  })

  it('uses default totals when parent totals are missing', () => {
    const parentCategories = [{ _id: 'p3', description: 'Entertainment' }]
    const monthlyCatExpenses = []
    const totals = {
      byParent: {},
      grand: {},
    }

    render(
      <RenderMonthlyExpenseItems
        parentCategories={parentCategories}
        monthlyCatExpenses={monthlyCatExpenses}
        totals={totals}
        toggleSelectableFn={mockToggleSelectable}
        deleteMonthlyCategoricalExpense={mockDelete}
        updateMonthlyCategoricalExpense={mockUpdate}
        createMonthlyCategoricalExpenses={mockCreate}
      />,
    )

    expect(screen.getByDisplayValue('Entertainment')).toBeInTheDocument()
    expect(screen.getByText('Projected: 0')).toBeInTheDocument()
    expect(screen.getByText('Actual: 0')).toBeInTheDocument()
    expect(screen.getByText('Difference: 0')).toBeInTheDocument()
  })

  it('does not render selectable checkbox in the UI', () => {
    const parentCategories = [{ _id: 'p1', description: 'Housing' }]
    const monthlyCatExpenses = [
      {
        _id: 'm1',
        parentId: 'p1',
        description: 'Rent',
        projectedAmount: 1000,
        actualAmount: 900,
        selectable: true,
      },
    ]
    const totals = {
      byParent: {
        p1: { projectedTotal: 1000, actualTotal: 900, difference: 100 },
      },
      grand: {},
    }

    render(
      <RenderMonthlyExpenseItems
        parentCategories={parentCategories}
        monthlyCatExpenses={monthlyCatExpenses}
        totals={totals}
        toggleSelectableFn={mockToggleSelectable}
        deleteMonthlyCategoricalExpense={mockDelete}
        updateMonthlyCategoricalExpense={mockUpdate}
        createMonthlyCategoricalExpenses={mockCreate}
      />,
    )

    // The selectable checkbox should NOT be rendered in the UI
    expect(screen.queryByRole('checkbox', { name: /selectable/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/selectable/i)).not.toBeInTheDocument()
  })
})
