import type { Timestamp } from "firebase/firestore"

/** Firestore users/{userId} */
export interface UserProfile {
  username: string
  displayName?: string
  photoURL?: string
  bio?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

/** Firestore repos/{repoId} */
export type RepoVisibility = "public" | "private"

export interface Repo {
  name: string
  description?: string
  ownerId: string
  visibility: RepoVisibility
  createdAt: Timestamp
  updatedAt?: Timestamp
  readme?: string
  languages?: string[]
}

/** Firestore repos/{repoId}/files/{fileId} */
export interface RepoFile {
  name: string
  path: string
  storagePath: string
  size?: number
  uploadedAt?: Timestamp
}

/** Build Storage path for a file. Pattern: users/{userId}/repos/{repoId}/{filePath} */
export function buildStoragePath(
  userId: string,
  repoId: string,
  filePath: string
): string {
  const normalized = filePath.replace(/^\//, "")
  return `users/${userId}/repos/${repoId}/${normalized}`
}

/** Parse storage path to get userId, repoId, filePath */
export function parseStoragePath(
  storagePath: string
): { userId: string; repoId: string; filePath: string } | null {
  const match = storagePath.match(/^users\/([^/]+)\/repos\/([^/]+)\/(.*)$/)
  if (!match) return null
  return { userId: match[1], repoId: match[2], filePath: match[3] }
}
