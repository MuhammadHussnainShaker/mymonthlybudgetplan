import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import useUserStore from '@/store/useUserStore'
import AuthLayout from '@/components/auth/AuthLayout'

describe('AuthLayout', () => {
  beforeEach(() => {
    localStorage.clear()
    useUserStore.setState({ user: { isAuthenticated: false, userData: null } })
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects unauthenticated users to login', async () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={true} />}>
            <Route path='/protected' element={<div>Protected</div>} />
          </Route>
          <Route path='/login' element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('renders protected content for authenticated users', async () => {
    useUserStore.setState({
      user: {
        isAuthenticated: true,
        userData: { _id: 'u1', displayName: 'Ali', isActive: true },
      },
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={true} />}>
            <Route path='/protected' element={<div>Protected</div>} />
          </Route>
          <Route path='/login' element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Protected')).toBeInTheDocument()
  })

  it('redirects authenticated users to dashboard on public routes', async () => {
    useUserStore.setState({
      user: {
        isAuthenticated: true,
        userData: { _id: 'u1', displayName: 'Ali', isActive: true },
      },
    })

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={false} />}>
            <Route path='/signup' element={<div>Signup Page</div>} />
          </Route>
          <Route path='/dashboard' element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
  })
})
