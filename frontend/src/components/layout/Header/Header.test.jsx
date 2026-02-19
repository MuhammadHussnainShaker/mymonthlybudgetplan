import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import useUserStore from '@/store/useUserStore'
import useMonthStore from '@/store/useMonthStore'
import Header from '@/components/layout/Header/Header'

describe('Header', () => {
  beforeEach(() => {
    useUserStore.setState({ user: { isAuthenticated: false, userData: null } })
    localStorage.clear()
    useMonthStore.setState({ month: '2026-02-01T00:00:00.000Z' })
  })

  function renderHeader() {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path='/'
            element={
              <>
                <Header />
                <div>Home</div>
              </>
            }
          />
          <Route path='/login' element={<div>Login Page</div>} />
          <Route path='/signup' element={<div>Signup Page</div>} />
          <Route
            path='/dashboard'
            element={
              <>
                <Header />
                <div>Dashboard Page</div>
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('shows public links when logged out', () => {
    renderHeader()

    expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /dashboard/i }),
    ).not.toBeInTheDocument()
  })

  it('shows private links when logged in and navigates', () => {
    useUserStore.setState({
      user: {
        isAuthenticated: true,
        userData: { _id: 'u1', displayName: 'Ali', isActive: true },
      },
    })
    renderHeader()

    fireEvent.click(screen.getByRole('button', { name: /dashboard/i }))

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /login/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('renders the month picker and updates the month store', () => {
    useUserStore.setState({
      user: {
        isAuthenticated: true,
        userData: { _id: 'u1', displayName: 'Ali', isActive: true },
      },
    })

    renderHeader()

    const monthInput = screen.getByLabelText(/month/i)
    expect(monthInput).toHaveValue('2026-02')

    fireEvent.change(monthInput, { target: { value: '2026-03' } })
    expect(useMonthStore.getState().month).toBe('2026-03-01T00:00:00.000Z')

    fireEvent.change(monthInput, { target: { value: '' } })
    expect(useMonthStore.getState().month).toBe('2026-03-01T00:00:00.000Z')
  })
})
