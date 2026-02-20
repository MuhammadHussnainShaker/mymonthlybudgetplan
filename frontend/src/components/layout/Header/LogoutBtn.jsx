import { auth } from '@/services/firebase/firebaseClient'
import useUserStore from '@/store/useUserStore'
import { apiFetch } from '@/utils/apiFetch'

export default function LogoutBtn() {
  const logout = useUserStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' })
    } catch {
      // Continue with client-side logout even if server call fails
    }
    try {
      await auth.signOut()
    } catch {
      // Continue with store logout even if Firebase signOut fails
    }
    logout()
  }

  return (
    <button
      className='px-3 py-1.5 rounded border border-slate-700/50'
      onClick={handleLogout}
    >
      Logout
    </button>
  )
}
