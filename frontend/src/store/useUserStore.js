import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useUserStore = create()(
  persist(
    (set) => ({
      user: {
        isAuthenticated: false,
        userData: null,
      },
      login: (data) => set({ user: { isAuthenticated: true, userData: data } }),
      logout: () => set({ user: { isAuthenticated: false, userData: null } }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user?.userData
          ? {
              isAuthenticated: state.user.isAuthenticated,
              userData: {
                _id: state.user.userData._id,
                displayName: state.user.userData.displayName,
                isActive: state.user.userData.isActive,
              },
            }
          : state.user,
      }),
    },
  ),
)

// TODO: Handle "Hydration"

export default useUserStore
