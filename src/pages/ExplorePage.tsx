import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  listPublicReposPage,
  searchReposByNameOrDescription,
  type ListPublicReposPageResult,
} from "@/lib/explore"
import { getProfilesByIds } from "@/lib/users"
import type { RepoWithId } from "@/lib/repos"
import type { UserProfile } from "@/types/schema"
import type { RepoProjectType } from "@/types/schema"
import type { QueryDocumentSnapshot } from "firebase/firestore"
import {
  Search,
  Code2,
  Sparkles,
  Globe,
  BarChart3,
  Shield,
  Cpu,
} from "lucide-react"

const CATEGORIES = [
  { id: "ai", labelKey: "explore.categoryAI", icon: Sparkles },
  { id: "web", labelKey: "explore.categoryWeb", icon: Globe },
  { id: "data", labelKey: "explore.categoryData", icon: BarChart3 },
  { id: "security", labelKey: "explore.categorySecurity", icon: Shield },
  { id: "embedded", labelKey: "explore.categoryEmbedded", icon: Cpu },
] as const

/** Map projectType to stitch-style badge label key */
function projectTypeBadgeKey(projectType?: RepoProjectType): string {
  switch (projectType) {
    case "research":
      return "explore.badgeResearchCode"
    case "startup":
      return "explore.badgeStartup"
    case "personal":
    default:
      return "explore.badgePublicArchive"
  }
}

/** Stitch uses colored dots per language */
const LANG_COLORS: Record<string, string> = {
  Python: "bg-yellow-400",
  JavaScript: "bg-yellow-300",
  TypeScript: "bg-blue-400",
  Java: "bg-red-500",
  "C++": "bg-blue-600",
  Go: "bg-blue-400",
  JSON: "bg-slate-400",
  Rust: "bg-orange-600",
  Vue: "bg-emerald-500",
  Markdown: "bg-slate-500",
}

function langColor(lang: string): string {
  return LANG_COLORS[lang] ?? "bg-primary"
}

/** Icon + bg color for repo card (stitch style) */
const CARD_STYLES = [
  { icon: "school", bg: "bg-blue-500/10", iconColor: "text-blue-500" },
  { icon: "account_balance", bg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
  { icon: "biotech", bg: "bg-purple-500/10", iconColor: "text-purple-500" },
  { icon: "bolt", bg: "bg-orange-500/10", iconColor: "text-orange-500" },
  { icon: "dns", bg: "bg-indigo-500/10", iconColor: "text-indigo-500" },
  { icon: "health_and_safety", bg: "bg-pink-500/10", iconColor: "text-pink-500" },
] as const

function getCardStyle(index: number) {
  return CARD_STYLES[index % CARD_STYLES.length]
}

interface PageCache {
  repos: RepoWithId[]
  lastDoc: QueryDocumentSnapshot | null
  hasMore: boolean
}

const SKELETON_COUNT = 6
const PAGE_SIZE = 12

function RepoCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-border-strong bg-white dark:bg-surface overflow-hidden">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-border-strong/80">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-5 w-20 rounded" />
        </div>
      </div>
    </div>
  )
}

function RepoCard({
  repo,
  owner,
  styleIndex,
}: {
  repo: RepoWithId
  owner: UserProfile | null
  styleIndex: number
}) {
  const { t } = useTranslation()
  const style = getCardStyle(styleIndex)
  const primaryLang = repo.languages?.[0]
  const badgeKey = projectTypeBadgeKey(repo.projectType)
  const ownerLine = owner?.displayName || owner?.username || "—"

  return (
    <Link
      to={`/repo/${repo.id}`}
      className="group flex flex-col bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-strong overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg dark:hover:shadow-primary/5"
    >
      <div className="p-5 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg} ${style.iconColor}`}
            >
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold text-base group-hover:text-primary transition-colors">
                {repo.name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{ownerLine}</p>
            </div>
          </div>
          {repo.languages && repo.languages.length > 0 && (
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1">
              <span className="text-[10px]">●</span> {repo.languages.length}
            </span>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-2 flex-1">
          {repo.description || "—"}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-border-strong/80">
          <div className="flex items-center gap-2">
            {primaryLang && (
              <>
                <span
                  className={`w-3 h-3 rounded-full ${langColor(primaryLang)}`}
                  aria-hidden
                />
                <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                  {primaryLang}
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
            {t(badgeKey)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ExplorePage() {
  const { t } = useTranslation()
  const [repos, setRepos] = useState<RepoWithId[]>([])
  const [ownerProfiles, setOwnerProfiles] = useState<Map<string, UserProfile | null>>(new Map())
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [searchApplied, setSearchApplied] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [categoryApplied, setCategoryApplied] = useState<string | null>(null)
  const [pagesCache, setPagesCache] = useState<Record<number, PageCache>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [isSearchMode, setIsSearchMode] = useState(false)

  const hasMore = pagesCache[currentPage]?.hasMore ?? false

  useEffect(() => {
    const ids = [...new Set(repos.map((r) => r.ownerId))]
    if (ids.length === 0) {
      setOwnerProfiles(new Map())
      return
    }
    getProfilesByIds(ids).then(setOwnerProfiles)
  }, [repos])

  const languageFromCategory = useCallback((categoryId: string): string | undefined => {
    const map: Record<string, string> = {
      ai: "Python",
      web: "JavaScript",
      data: "Python",
      security: "Python",
      embedded: "C++",
    }
    return map[categoryId]
  }, [])

  const loadFirstPage = useCallback(async () => {
    setLoading(true)
    setRepos([])
    setPagesCache({})
    setCurrentPage(1)
    if (searchApplied.trim()) {
      setIsSearchMode(true)
      try {
        const list = await searchReposByNameOrDescription(searchApplied.trim())
        setRepos(list)
      } finally {
        setLoading(false)
      }
      return
    }
    setIsSearchMode(false)
    const languageFilter = categoryApplied
      ? languageFromCategory(categoryApplied)
      : undefined
    try {
      const result: ListPublicReposPageResult = await listPublicReposPage({
        pageSize: PAGE_SIZE,
        languageFilter,
      })
      setRepos(result.repos)
      setPagesCache({
        1: { repos: result.repos, lastDoc: result.lastDoc, hasMore: result.hasMore },
      })
    } finally {
      setLoading(false)
    }
  }, [searchApplied, categoryApplied, languageFromCategory])

  useEffect(() => {
    loadFirstPage()
  }, [loadFirstPage])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || isSearchMode) return
    const cached = pagesCache[currentPage]
    const nextPage = currentPage + 1
    const prevCache = cached
    if (!prevCache?.lastDoc) return
    setLoadingMore(true)
    const languageFilter = categoryApplied
      ? languageFromCategory(categoryApplied)
      : undefined
    try {
      const { listPublicReposPage: listPage } = await import("@/lib/explore")
      const result = await listPage({
        pageSize: PAGE_SIZE,
        languageFilter,
        startAfterDoc: prevCache.lastDoc,
      })
      setPagesCache((prev) => ({
        ...prev,
        [nextPage]: {
          repos: result.repos,
          lastDoc: result.lastDoc,
          hasMore: result.hasMore,
        },
      }))
      setCurrentPage(nextPage)
      setRepos((prev) => [...prev, ...result.repos])
    } finally {
      setLoadingMore(false)
    }
  }, [currentPage, hasMore, isSearchMode, loadingMore, categoryApplied, languageFromCategory, pagesCache])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchApplied(search)
  }

  const handleCategoryClick = (id: string) => {
    const next = categoryFilter === id ? null : id
    setCategoryFilter(next)
    setCategoryApplied(next)
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="layout-content-container flex flex-col max-w-[1200px] w-full flex-1 px-4 md:px-10 mx-auto py-5">
        {/* Hero */}
        <section className="@container">
          <div className="flex flex-col gap-6 py-8 min-[864px]:flex-row min-[864px]:items-center">
            <div className="flex flex-col gap-4 flex-1">
              <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-[480px]:text-5xl">
                {t("explore.heroTitle")}{" "}
                <span className="text-primary">{t("explore.heroTitleHighlight")}</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-normal leading-relaxed max-w-2xl">
                {t("explore.heroSubtitle")}
              </p>
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-3 mt-4"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 size-5 text-slate-500 dark:text-subtle-fg" />
                  <Input
                    type="text"
                    placeholder={t("explore.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-12 rounded-lg bg-slate-100 dark:bg-border-strong/40 border-none text-slate-900 dark:text-white pl-10 pr-4 focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500 dark:placeholder:text-subtle-fg"
                  />
                </div>
                <select
                  className="h-12 rounded-lg bg-slate-100 dark:bg-border-strong/40 border-none text-slate-900 dark:text-white px-4 pr-10 focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  aria-label={t("explore.universityFilter")}
                >
                  <option>{t("explore.allUniversities")}</option>
                  <option>USTHB</option>
                  <option>ESI Algiers</option>
                  <option>Constantine 2</option>
                  <option>Oran 1</option>
                </select>
                <Button
                  type="submit"
                  className="h-12 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t("explore.search")}
                </Button>
              </form>
            </div>
            <div className="hidden min-[864px]:flex w-[300px] h-[200px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/10 items-center justify-center shrink-0">
              <Code2 className="size-14 text-primary" />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
              {t("explore.browseByCategory")}
            </h2>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter(null)
                setCategoryApplied(null)
              }}
              className="text-primary text-sm font-medium hover:underline"
            >
              {t("explore.viewAll")}
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = categoryFilter === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex h-10 items-center justify-center gap-x-2 rounded-full border px-5 transition-all group ${
                    isActive
                      ? "border-primary/50 bg-slate-50 dark:bg-border-strong/40"
                      : "border-slate-200 dark:border-border-strong bg-white dark:bg-surface hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-surface-muted"
                  }`}
                >
                  <Icon className="size-5 text-primary" />
                  <span className="text-slate-900 dark:text-white text-sm font-medium">
                    {t(cat.labelKey)}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Trending Repositories */}
        <section className="py-4">
          <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-6">
            {t("explore.trendingRepos")}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <RepoCardSkeleton key={i} />
              ))}
            </div>
          ) : repos.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">{t("explore.noRepos")}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repos.map((repo, i) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    owner={ownerProfiles.get(repo.ownerId) ?? null}
                    styleIndex={i}
                  />
                ))}
              </div>
              {!isSearchMode && hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-lg"
                  >
                    {loadingMore ? (
                      <>
                        <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {t("explore.loadingMore")}
                      </>
                    ) : (
                      t("explore.loadMore")
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* CTA Banner */}
        <section className="my-10 w-full rounded-2xl bg-cover bg-center overflow-hidden relative bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/10">
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-surface-page/80 backdrop-blur-[2px]" />
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-white text-3xl font-bold mb-3">
                {t("explore.ctaTitle")}
              </h2>
              <p className="text-slate-300 text-base">{t("explore.ctaSubtitle")}</p>
            </div>
            <div className="flex gap-4 shrink-0">
              <Button
                asChild
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                <Link to="/create-project">{t("explore.submitRepository")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
