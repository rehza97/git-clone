import {
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  limit,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import type { UserProfile } from "@/types/schema"

export type UserProfileWithId = UserProfile & { userId: string }

const USERS = "users"
const USERNAMES = "usernames"

export async function createUserProfile(
  userId: string,
  data: {
    displayName?: string
    photoURL?: string
    username: string
    bio?: string
  }
): Promise<void> {
  const ref = doc(db, USERS, userId)
  const profile: UserProfile & { createdAt: Timestamp; updatedAt: Timestamp } = {
    username: data.username,
    displayName: data.displayName ?? "",
    photoURL: data.photoURL,
    bio: data.bio ?? "",
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  }
  await setDoc(ref, profile)
  await setDoc(doc(db, USERNAMES, data.username.toLowerCase()), { userId })
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<UserProfile, "displayName" | "photoURL" | "username" | "bio">>
): Promise<void> {
  const ref = doc(db, USERS, userId)
  const update: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  }
  if (data.username !== undefined) {
    const snap = await getDoc(ref)
    const oldUsername = snap.get("username") as string | undefined
    if (oldUsername && oldUsername.toLowerCase() !== data.username.toLowerCase()) {
      await deleteDoc(doc(db, USERNAMES, oldUsername.toLowerCase()))
    }
    await setDoc(doc(db, USERNAMES, data.username.toLowerCase()), { userId })
  }
  await updateDoc(ref, update)
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, USERS, userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

/** Fetch multiple user profiles by ID. Returns a Map of userId -> profile (null if not found). */
export async function getProfilesByIds(
  userIds: string[]
): Promise<Map<string, UserProfile | null>> {
  const unique = [...new Set(userIds)]
  const results = await Promise.all(unique.map((id) => getUserProfile(id)))
  const map = new Map<string, UserProfile | null>()
  unique.forEach((id, i) => map.set(id, results[i] ?? null))
  return map
}

/** List user profiles for discovery/search. Limited to 80 for performance. */
export async function listUserProfiles(opts?: { limitCount?: number }): Promise<UserProfileWithId[]> {
  const ref = collection(db, USERS)
  const q = query(ref, limit(opts?.limitCount ?? 80))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ userId: d.id, ...d.data() } as UserProfileWithId))
}

const DEBUG_PROFILE = true
function profileLog(...args: unknown[]) {
  if (DEBUG_PROFILE) console.log("[Profile/users]", ...args)
}

export async function getUserIdByUsername(username: string): Promise<string | null> {
  const key = username.toLowerCase()
  const ref = doc(db, USERNAMES, key)
  const snap = await getDoc(ref)
  profileLog("getUserIdByUsername", { key, exists: snap.exists(), userId: snap.exists() ? snap.get("userId") : null })
  if (!snap.exists()) return null
  return (snap.get("userId") as string) ?? null
}

/**
 * Resolve userId by username. Tries usernames collection first, then falls back to
 * scanning users collection (case-insensitive) so profiles work even if usernames
 * mapping is missing (e.g. after import).
 */
export async function findUserIdByUsername(username: string): Promise<string | null> {
  const normalized = username.trim().toLowerCase()
  profileLog("findUserIdByUsername", { input: username, normalized })
  if (!normalized) {
    profileLog("findUserIdByUsername: empty normalized, return null")
    return null
  }
  const fromMapping = await getUserIdByUsername(normalized)
  if (fromMapping) {
    profileLog("findUserIdByUsername: found via usernames", { uid: fromMapping })
    return fromMapping
  }
  profileLog("findUserIdByUsername: usernames miss, falling back to users list")
  const list = await listUserProfiles({ limitCount: 200 })
  profileLog("findUserIdByUsername: listUserProfiles count", list.length, "usernames:", list.map((p) => p.username))
  const match = list.find(
    (p) => (p.username ?? "").toLowerCase() === normalized
  )
  if (match) {
    profileLog("findUserIdByUsername: found via fallback", { userId: match.userId, username: match.username })
    return match.userId
  }
  profileLog("findUserIdByUsername: no match, return null")
  return null
}

export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  const ref = doc(db, USERNAMES, username.toLowerCase())
  const snap = await getDoc(ref)
  if (!snap.exists()) return true
  const uid = snap.get("userId") as string | null
  if (!uid) return true
  if (excludeUserId && uid === excludeUserId) return true
  return false
}
