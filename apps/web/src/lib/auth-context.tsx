import { createContext, useContext, type ReactNode } from 'react'
import { useSession, useLogin, useSignup, useLogout, type Session } from '@/lib/hooks/useAuth'
import type { UseMutationResult } from '@tanstack/react-query'

interface AuthContextValue {
  session: Session | null | undefined
  user: Session['user'] | null | undefined
  isAuthenticated: boolean
  isLoading: boolean
  login: UseMutationResult<unknown, Error, { email: string; password: string }>
  signup: UseMutationResult<unknown, Error, { email: string; password: string; name: string }>
  logout: UseMutationResult<unknown, Error, void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isLoading } = useSession()
  const login = useLogin()
  const signup = useSignup()
  const logout = useLogout()

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const DEFAULT_AUTH: AuthContextValue = {
  session: undefined,
  user: undefined,
  isAuthenticated: false,
  isLoading: true,
  login: {} as AuthContextValue['login'],
  signup: {} as AuthContextValue['signup'],
  logout: {} as AuthContextValue['logout'],
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context ?? DEFAULT_AUTH
}
