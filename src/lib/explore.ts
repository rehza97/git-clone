import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import type { RepoWithId } from "./repos"
import type { Timestamp } from "firebase/firestore"

const PAGE_SIZE = 12

export interface ListPublicReposPageResult {
  repos: RepoWithId[]
  lastDoc: QueryDocumentSnapshot | null
  hasMore: boolean
}

/** Paginated list of public repos (newest first). Use lastDoc to fetch next page. */
export async function listPublicReposPage(opts: {
  pageSize?: number
  languageFilter?: string
  startAfterDoc?: QueryDocumentSnapshot | null
}): Promise<ListPublicReposPageResult> {
  const pageSize = opts.pageSize ?? PAGE_SIZE

  try {
    const ref = collection(db, "repos")
    const q = opts.startAfterDoc
      ? query(
          ref,
          where("visibility", "==", "public"),
          orderBy("createdAt", "desc"),
          limit(pageSize),
          startAfter(opts.startAfterDoc)
        )
      : query(
          ref,
          where("visibility", "==", "public"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        )
    const snap = await getDocs(q)
    let list = snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as RepoWithId))
    if (opts.languageFilter) {
      list = list.filter((r: RepoWithId) => r.languages?.includes(opts.languageFilter!))
    }
    const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
    const hasMore = snap.docs.length === pageSize
    return { repos: list, lastDoc, hasMore }
  } catch (err: unknown) {
    const isIndexError =
      err &&
      typeof err === "object" &&
      "code" in err &&
      ((err as { code?: string }).code === "failed-precondition" ||
        (err as { message?: string }).message?.includes("index"))
    if (isIndexError && !opts.startAfterDoc) {
      const list = await listPublicRepos({
        limitCount: pageSize,
        languageFilter: opts.languageFilter,
      })
      return { repos: list, lastDoc: null, hasMore: false }
    }
    throw err
  }
}

export async function listPublicRepos(opts: {
  limitCount?: number
  languageFilter?: string
}): Promise<RepoWithId[]> {
  const ref = collection(db, "repos")
  const constraints = [where("visibility", "==", "public"), limit(opts.limitCount ?? 100)]
  const q = query(ref, ...constraints)
  const snap = await getDocs(q)
  let list = snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as RepoWithId))
  if (opts.languageFilter) {
    list = list.filter((r: RepoWithId) => r.languages?.includes(opts.languageFilter!))
  }
  list.sort((a: RepoWithId, b: RepoWithId) => {
    const ta = (a as RepoWithId & { createdAt?: Timestamp }).createdAt
    const tb = (b as RepoWithId & { createdAt?: Timestamp }).createdAt
    if (!ta || !tb) return 0
    return tb.toMillis() - ta.toMillis()
  })
  return list
}

export async function searchReposByNameOrDescription(term: string): Promise<RepoWithId[]> {
  if (!term.trim()) return []
  const all = await listPublicRepos({ limitCount: 100 })
  const t = term.trim().toLowerCase()
  return all.filter(
    (r) =>
      r.name.toLowerCase().includes(t) ||
      (r.description ?? "").toLowerCase().includes(t)
  )
}
