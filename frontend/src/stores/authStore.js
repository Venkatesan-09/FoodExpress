import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      isRole: (role) => {
        const user = get().user
        if (!user) return false
        return Array.isArray(role) ? role.includes(user.role) : user.role === role
      },
    }),
    {
      name: 'foodexpress-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
)
