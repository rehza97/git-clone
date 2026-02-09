import { useEffect, useState } from "react"
import { getRepo, type RepoWithId } from "@/lib/repos"
import type { Timestamp } from "firebase/firestore"

export function useRepo(repoId: string | undefined) {
  const [repo, setRepo] = useState<(RepoWithId & { createdAt: Timestamp }) | null>(null)
  const [loading, setLoading] = useState(!!repoId)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!repoId) {
      setRepo(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    getRepo(repoId)
      .then((r) => {
        setRepo(r)
        if (!r) setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [repoId])

  return { repo, loading, error }
}
