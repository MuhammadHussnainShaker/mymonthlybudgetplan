import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import useUserStore from '@/store/useUserStore'

// Mock Firebase auth - must be before the import
vi.mock('@/services/firebase/firebaseClient', () => ({
  auth: {
    signOut: vi.fn(() => Promise.resolve()),
  },
}))

import LogoutBtn from '@/components/layout/Header/LogoutBtn'
import { auth } from '@/services/firebase/firebaseClient'

describe('LogoutBtn', () => {
  beforeEach(() => {
    useUserStore.setState({
      firebaseUser: { uid: 'test-uid', emailVerified: true },
      loading: false,
      user: {
        isAuthenticated: true,
        userData: { _id: 'u1', displayName: 'Ali', isActive: true },
      },
    })
    vi.clearAllMocks()
  })

  it('calls Firebase signOut and store logout on click', async () => {
    const logoutMock = vi.fn()
    useUserStore.setState({ logout: logoutMock })

    render(<LogoutBtn />)

    fireEvent.click(screen.getByRole('button', { name: /logout/i }))

    await waitFor(() => {
      expect(auth.signOut).toHaveBeenCalledTimes(1)
      expect(logoutMock).toHaveBeenCalledTimes(1)
    })
  })
})
