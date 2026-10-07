import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/types/auth"
import { register, login, logout, getCurrentUser } from "@/services/authService"

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => Promise.reject(new Error("not implemented")),
  register: async () => Promise.reject(new Error("not implemented")),
  logout: async () => Promise.resolve(),
  refreshUser: async () => Promise.resolve(),
})

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (userData: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setIsAuthenticated(!!currentUser)
      } catch (error) {
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    restoreAuth()
  }, [])

  const doLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(false)
    try {
      await login(credentials)
      setIsAuthenticated(true)
    } catch (error: any) {
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const doRegister = async (userData: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => {
    setIsLoading(false)
    try {
      await register(userData)
      setIsAuthenticated(true)
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const doLogout = async () => {
    setIsLoading(false)
    try {
      await logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserFn = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    setIsAuthenticated(!!currentUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login: doLogin,
        register: doRegister,
        logout: doLogout,
        refreshUser: refreshUserFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)