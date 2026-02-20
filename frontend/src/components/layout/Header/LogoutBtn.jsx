import { auth } from '@/services/firebase/firebaseClient'
import useUserStore from '@/store/useUserStore'
import { apiFetch } from '@/utils/apiFetch'

export default function LogoutBtn() {
  const logout = useUserStore((state) => state.logout)

  const handleLogout = async () => {
    await apiFetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {})
    await auth.signOut().catch(() => {})
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
