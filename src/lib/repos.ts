import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import type { Repo, RepoVisibility } from "@/types/schema"

const REPOS = "repos"

export interface RepoWithId extends Repo {
  id: string
}

export async function createRepo(
  ownerId: string,
  data: { name: string; description?: string; visibility: RepoVisibility }
): Promise<string> {
  const ref = collection(db, REPOS)
  const docRef = await addDoc(ref, {
    name: data.name.trim(),
    description: (data.description ?? "").trim() || undefined,
    ownerId,
    visibility: data.visibility,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getRepo(repoId: string): Promise<(RepoWithId & { createdAt: Timestamp }) | null> {
  const ref = doc(db, REPOS, repoId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as RepoWithId & { createdAt: Timestamp }
}

export async function listReposByOwner(ownerId: string): Promise<RepoWithId[]> {
  const ref = collection(db, REPOS)
  const q = query(ref, where("ownerId", "==", ownerId))
  const snap = await getDocs(q)
  const list = snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as RepoWithId))
  list.sort((a: RepoWithId, b: RepoWithId) => {
    const ta = (a as RepoWithId & { createdAt?: Timestamp }).createdAt
    const tb = (b as RepoWithId & { createdAt?: Timestamp }).createdAt
    if (!ta || !tb) return 0
    return tb.toMillis() - ta.toMillis()
  })
  return list
}

/**
 * List public repos for an owner. Use this for public profile pages so the query
 * only requests documents readable by unauthenticated users (avoids permission denied).
 */
export async function listPublicReposByOwner(ownerId: string): Promise<RepoWithId[]> {
  const ref = collection(db, REPOS)
  const q = query(
    ref,
    where("ownerId", "==", ownerId),
    where("visibility", "==", "public")
  )
  const snap = await getDocs(q)
  const list = snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as RepoWithId))
  list.sort((a: RepoWithId, b: RepoWithId) => {
    const ta = (a as RepoWithId & { createdAt?: Timestamp }).createdAt
    const tb = (b as RepoWithId & { createdAt?: Timestamp }).createdAt
    if (!ta || !tb) return 0
    return tb.toMillis() - ta.toMillis()
  })
  return list
}

export async function updateRepo(
  repoId: string,
  data: Partial<Pick<Repo, "name" | "description" | "visibility" | "readme" | "languages">>
): Promise<void> {
  const ref = doc(db, REPOS, repoId)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteRepo(repoId: string): Promise<void> {
  const ref = doc(db, REPOS, repoId)
  await deleteDoc(ref)
}
