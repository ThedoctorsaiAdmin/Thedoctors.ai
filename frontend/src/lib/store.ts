import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: Record<string, any>
  clinicId: string
  clinicCode: string
  clinicName: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isSuperAdmin: boolean

  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setSuperAdmin: (token: string) => void
  logout: () => void
  hasPermission: (module: string, action: 'view' | 'edit' | 'create') => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isSuperAdmin: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true, isSuperAdmin: false })
      },

      setSuperAdmin: (token) => {
        set({ accessToken: token, isAuthenticated: true, isSuperAdmin: true })
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isSuperAdmin: false })
      },

      hasPermission: (module, action) => {
        const { user } = get()
        if (!user) return false
        if (user.role === 'admin') return true
        return user.permissions?.[module]?.[action] === true
      }
    }),
    { name: 'thedoctors-auth' }
  )
)
