import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { listUserProfiles, type UserProfileWithId } from "@/lib/users"
import { listPublicReposByOwner } from "@/lib/repos"
import { Search, ChevronDown, FolderArchive, ChevronLeft, ChevronRight } from "lucide-react"
import type { RepoWithId } from "@/lib/repos"
import type { Timestamp } from "firebase/firestore"

const CARDS_PER_PAGE = 6
const SKELETON_COUNT = 6
const MAX_USERS_FOR_LATEST_REPO = 24

const CARD_GRADIENTS = [
  "from-blue-900 to-slate-900",
  "from-emerald-900 to-slate-900",
  "from-purple-900 to-slate-900",
  "from-orange-900 to-slate-900",
  "from-teal-900 to-slate-900",
  "from-red-900 to-slate-900",
]

function formatTimeAgo(ts: Timestamp | undefined): string {
  if (!ts?.toMillis) return "—"
  const ms = Date.now() - ts.toMillis()
  if (ms < 60 * 60 * 1000) return "1 hour ago"
  if (ms < 24 * 60 * 60 * 1000) return "2 hours ago"
  if (ms < 2 * 24 * 60 * 60 * 1000) return "Yesterday"
  if (ms < 7 * 24 * 60 * 60 * 1000) return "2 days ago"
  if (ms < 14 * 24 * 60 * 60 * 1000) return "1 week ago"
  return "2 weeks ago"
}

type LatestRepo = { name: string; repoId: string; updatedAt?: Timestamp; languages?: string[] }

function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-surface border border-slate-200 dark:border-border-strong rounded-xl overflow-hidden shadow-sm">
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-t-xl" />
      <div className="pt-12 px-5 pb-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-border-strong">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  )
}

function ProfileCard({
  profile,
  index,
  latestRepo,
}: {
  profile: UserProfileWithId
  index: number
  latestRepo: LatestRepo | null
}) {
  const { t } = useTranslation()
  const displayName = profile.displayName || profile.username || "—"
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  const tags = (latestRepo?.languages?.length ? latestRepo.languages.slice(0, 3) : null) ?? ["—"]

  return (
    <div className="flex flex-col bg-white dark:bg-surface border border-slate-200 dark:border-border-strong rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`h-24 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute -bottom-10 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-white dark:border-surface overflow-hidden bg-slate-800">
            <Avatar className="h-full w-full rounded-full">
              <AvatarImage src={profile.photoURL} alt="" className="object-cover" />
              <AvatarFallback className="text-lg bg-slate-700 text-slate-200">
                {(displayName || "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      <div className="pt-12 px-5 pb-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg truncate">
              <Link to={`/${profile.username}`} className="hover:text-primary hover:underline transition-colors">
                {displayName}
              </Link>
            </h3>
            <Link to={`/${profile.username}`} className="text-primary text-sm font-medium hover:underline truncate block">
              @{profile.username}
            </Link>
          </div>
          <button
            type="button"
            className="bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-3 py-1.5 text-sm font-bold transition-colors"
          >
            {t("usersSearch.follow")}
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
          {profile.bio || "—"}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-100 dark:bg-surface-muted text-slate-600 dark:text-slate-300 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-border-strong">
          <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">
            {t("usersSearch.latestArchive")}
          </p>
          {latestRepo ? (
            <Link
              to={`/repo/${latestRepo.repoId}`}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="p-2 rounded bg-slate-100 dark:bg-surface-page text-slate-400 group-hover:text-primary transition-colors">
                <FolderArchive className="size-5" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-slate-900 dark:text-slate-200 text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {latestRepo.name}
                </p>
                <p className="text-slate-500 text-xs truncate">
                  {formatTimeAgo(latestRepo.updatedAt)}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-slate-100 dark:bg-surface-page text-slate-400">
                <FolderArchive className="size-5" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-slate-500 dark:text-slate-400 text-sm">—</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SearchUsersPage() {
  const { t } = useTranslation()
  const [profiles, setProfiles] = useState<UserProfileWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchSubmitted, setSearchSubmitted] = useState("")
  const [latestRepos, setLatestRepos] = useState<Map<string, LatestRepo>>(new Map())
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    listUserProfiles({ limitCount: 80 })
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!searchSubmitted.trim()) return profiles
    const term = searchSubmitted.trim().toLowerCase()
    return profiles.filter(
      (p) =>
        (p.username ?? "").toLowerCase().includes(term) ||
        (p.displayName ?? "").toLowerCase().includes(term) ||
        (p.bio ?? "").toLowerCase().includes(term)
    )
  }, [profiles, searchSubmitted])

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE
    return filtered.slice(start, start + CARDS_PER_PAGE)
  }, [filtered, currentPage])

  useEffect(() => {
    const ids = paginated.slice(0, MAX_USERS_FOR_LATEST_REPO).map((p) => p.userId)
    if (ids.length === 0) return
    const map = new Map<string, LatestRepo>()
    Promise.all(
      ids.map(async (userId) => {
        try {
          const repos = await listPublicReposByOwner(userId)
          const repo = repos[0] as (RepoWithId & { createdAt?: Timestamp }) | undefined
          if (repo) {
            map.set(userId, {
              name: repo.name,
              repoId: repo.id,
              updatedAt: repo.createdAt,
              languages: repo.languages,
            })
          }
        } catch {
          // ignore
        }
      })
    ).then(() => setLatestRepos(map))
  }, [paginated.map((p) => p.userId).join(",")])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchSubmitted(search)
    setCurrentPage(1)
  }

  return (
    <main className="flex-1 flex flex-col items-center w-full px-4 py-8 lg:px-40">
      {/* Search Header */}
      <div className="flex flex-col max-w-[960px] w-full mb-12">
        <div className="text-center mb-8">
          <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] md:text-[40px] font-bold leading-tight mb-2">
            {t("usersSearch.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-normal leading-normal">
            {t("usersSearch.subtitle")}
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="w-full mb-6">
          <label className="flex flex-col h-14 w-full shadow-lg rounded-xl overflow-hidden relative group">
            <div className="flex w-full flex-1 items-stretch bg-white dark:bg-surface border border-slate-200 dark:border-border-strong focus-within:border-primary dark:focus-within:border-primary transition-colors rounded-xl">
              <div className="text-slate-400 flex items-center justify-center pl-4 pr-2">
                <Search className="size-5" />
              </div>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("usersSearch.searchPlaceholder")}
                className="flex w-full min-w-0 flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-normal leading-normal h-full"
                autoComplete="off"
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-6 font-medium transition-colors rounded-none hidden sm:flex shrink-0"
              >
                {t("usersSearch.search")}
              </Button>
            </div>
          </label>
        </form>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-slate-200 dark:bg-surface-muted hover:bg-slate-300 dark:hover:bg-surface-muted/90 transition-colors px-4 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          >
            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-normal">
              {t("usersSearch.filterUniversity")}
            </span>
            <ChevronDown className="size-4 text-slate-500" />
          </button>
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-slate-200 dark:bg-surface-muted hover:bg-slate-300 dark:hover:bg-surface-muted/90 transition-colors px-4 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          >
            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-normal">
              {t("usersSearch.filterSkills")}
            </span>
            <ChevronDown className="size-4 text-slate-500" />
          </button>
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-slate-200 dark:bg-surface-muted hover:bg-slate-300 dark:hover:bg-surface-muted/90 transition-colors px-4 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          >
            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-normal">
              {t("usersSearch.filterContribution")}
            </span>
            <ChevronDown className="size-4 text-slate-500" />
          </button>
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-slate-200 dark:bg-surface-muted hover:bg-slate-300 dark:hover:bg-surface-muted/90 transition-colors px-4 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          >
            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-normal">
              {t("usersSearch.filterStatus")}
            </span>
            <ChevronDown className="size-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))
        ) : paginated.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
            {searchSubmitted.trim() ? t("users.noResults") : t("users.noUsers")}
          </div>
        ) : (
          paginated.map((profile, i) => (
            <ProfileCard
              key={profile.userId}
              profile={profile}
              index={i}
              latestRepo={latestRepos.get(profile.userId) ?? null}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-200 dark:bg-surface-muted text-slate-500 dark:text-white hover:bg-slate-300 dark:hover:bg-surface-muted/90 transition-colors disabled:opacity-50"
            aria-label={t("usersSearch.previousPage")}
          >
            <ChevronLeft className="size-5" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1
            const isActive = page === currentPage
            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`flex items-center justify-center h-10 w-10 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white font-bold"
                    : "bg-slate-200 dark:bg-surface-muted text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-surface-muted/90"
                }`}
              >
                {page}
              </button>
            )
          })}
          {totalPages > 5 && <span className="text-slate-400 px-2">...</span>}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-200 dark:bg-surface-muted text-slate-500 dark:text-white hover:bg-slate-300 dark:hover:bg-surface-muted/90 transition-colors disabled:opacity-50"
            aria-label={t("usersSearch.nextPage")}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </main>
  )
}
