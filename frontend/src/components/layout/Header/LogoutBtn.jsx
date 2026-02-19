import { auth } from '@/services/firebase/firebaseClient'
import useUserStore from '@/store/useUserStore'

export default function LogoutBtn() {
  const logout = useUserStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      await auth.signOut()
      logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  // TODO: create logout functionality on backend and use that to clear accessToken from cookies

  return (
    <button
      className='px-3 py-1.5 rounded border border-slate-700/50'
      onClick={handleLogout}
    >
      Logout
    </button>
  )
}
