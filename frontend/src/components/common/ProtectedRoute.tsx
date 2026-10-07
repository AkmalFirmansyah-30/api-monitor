import { Navigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

export function ProtectedRoute() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setChecked(true)
  }, [isLoading, isAuthenticated])

  if (!checked) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return null
}