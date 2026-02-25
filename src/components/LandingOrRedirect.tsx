import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LandingPage } from "@/pages/LandingPage"

export function LandingOrRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <LandingPage />
}
