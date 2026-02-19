import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import useUserStore from '@/store/useUserStore'
import AuthLayout from '@/components/auth/AuthLayout'

describe('Protected Routes Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects anonymous users from protected routes to login', async () => {
    useUserStore.setState({
      firebaseUser: null,
      loading: false,
      user: { isAuthenticated: false, userData: null },
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={true} />}>
            <Route path='/dashboard' element={<div>Dashboard</div>} />
          </Route>
          <Route path='/login' element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  // it('redirects unverified users from protected routes to /login', async () => {
  //   useUserStore.setState({
  //     user: { isAuthenticated: false, userData: null },
  //   })

  //   render(
  //     <MemoryRouter initialEntries={['/dashboard']}>
  //       <Routes>
  //         <Route element={<AuthLayout authenticationRequired={true} />}>
  //           <Route path='/dashboard' element={<div>Dashboard</div>} />
  //         </Route>
  //         <Route path='/login' element={<div>Login</div>} />
  //       </Routes>
  //     </MemoryRouter>,
  //   )

  //   expect(await screen.findByText('Sign In')).toBeInTheDocument()
  // })

  it('redirects verified Firebase users without backend auth to login', async () => {
    useUserStore.setState({
      firebaseUser: { uid: 'test-uid', emailVerified: true },
      loading: false,
      user: { isAuthenticated: false, userData: null },
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={true} />}>
            <Route path='/dashboard' element={<div>Dashboard</div>} />
          </Route>
          <Route path='/login' element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('allows access to protected routes for fully authenticated users', async () => {
    useUserStore.setState({
      firebaseUser: { uid: 'test-uid', emailVerified: true },
      loading: false,
      user: {
        isAuthenticated: true,
        userData: { _id: 'user-123', displayName: 'Test User', isActive: true },
      },
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={true} />}>
            <Route path='/dashboard' element={<div>Dashboard</div>} />
          </Route>
          <Route path='/login' element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
  })

  it('redirects fully authenticated users from public auth routes to dashboard', async () => {
    useUserStore.setState({
      firebaseUser: { uid: 'test-uid', emailVerified: true },
      loading: false,
      user: {
        isAuthenticated: true,
        userData: { _id: 'user-123', displayName: 'Test User', isActive: true },
      },
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={false} />}>
            <Route path='/login' element={<div>Login Page</div>} />
          </Route>
          <Route path='/dashboard' element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
  })

  it('allows anonymous users to access public auth routes', async () => {
    useUserStore.setState({
      firebaseUser: null,
      loading: false,
      user: { isAuthenticated: false, userData: null },
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={false} />}>
            <Route path='/login' element={<div>Login Page</div>} />
          </Route>
          <Route path='/dashboard' element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('allows unverified users to access verify-email page', async () => {
    useUserStore.setState({
      firebaseUser: { uid: 'test-uid', emailVerified: false },
      loading: false,
      user: { isAuthenticated: false, userData: null },
    })

    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <Routes>
          <Route element={<AuthLayout authenticationRequired={false} />}>
            <Route path='/verify-email' element={<div>Verify Email Page</div>} />
          </Route>
          <Route path='/dashboard' element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Verify Email Page')).toBeInTheDocument()
  })
})
