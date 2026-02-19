import { beforeEach, describe, expect, it } from 'vitest'
import useUserStore from '@/store/useUserStore'

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ user: { isAuthenticated: false, userData: null } })
  })

  it('login() sets authenticated user', () => {
    const u = { _id: 'u1', displayName: 'Ali', isActive: true }
    useUserStore.getState().login(u)
    expect(useUserStore.getState().user.isAuthenticated).toBe(true)
    expect(useUserStore.getState().user.userData).toEqual(u)
  })

  it('logout() clears auth', () => {
    useUserStore
      .getState()
      .login({ _id: 'u1', displayName: 'Ali', isActive: true })
    useUserStore.getState().logout()
    expect(useUserStore.getState().user.isAuthenticated).toBe(false)
    expect(useUserStore.getState().user.userData).toBeNull()
  })
})
