import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserProfile } from "@/lib/users"
import type { UserProfile } from "@/types/schema"

export function useUserProfile(): UserProfile | null {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    let cancelled = false
    getUserProfile(user.uid).then((p) => {
      if (!cancelled) setProfile(p)
    })
    return () => {
      cancelled = true
    }
  }, [user?.uid])

  return profile
}
