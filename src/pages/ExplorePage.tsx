import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  listPublicReposPage,
  searchReposByNameOrDescription,
  type ListPublicReposPageResult,
} from "@/lib/explore"
import { getProfilesByIds } from "@/lib/users"
import type { RepoWithId } from "@/lib/repos"
import type { UserProfile } from "@/types/schema"
import type { QueryDocumentSnapshot } from "firebase/firestore"
import { FilterIcon, SearchIcon, XIcon } from "lucide-react"

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "Vue", "Markdown"]
const SKELETON_COUNT = 6

interface PageCache {
  repos: RepoWithId[]
  lastDoc: QueryDocumentSnapshot | null
  hasMore: boolean
}

function RepoCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
        <div className="flex flex-wrap gap-1 mt-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-9 w-16 rounded-md" />
      </CardContent>
    </Card>
  )
}

function RepoCard({
  repo,
  owner,
}: {
  repo: RepoWithId
  owner: UserProfile | null
}) {
  const displayName = owner?.displayName || owner?.username || "—"
  const username = owner?.username

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Avatar size="sm" className="size-6">
            {owner?.photoURL && <AvatarImage src={owner.photoURL} alt="" />}
            <AvatarFallback className="text-xs">
              {(owner?.displayName || owner?.username || "?")[0]}
            </AvatarFallback>
          </Avatar>
          {username ? (
            <Link
              to={`/${username}`}
              className="text-muted-foreground hover:text-foreground text-sm truncate"
            >
              {displayName}
            </Link>
          ) : (
            <span className="text-muted-foreground text-sm truncate">{displayName}</span>
          )}
        </div>
        <CardTitle className="truncate">
          <Link to={`/repo/${repo.id}`} className="hover:underline">
            {repo.name}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {repo.description || "—"}
        </CardDescription>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">عام</Badge>
          {repo.languages?.map((l) => (
            <Badge key={l} variant="secondary">
              {l}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/repo/${repo.id}`}>عرض</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function ExploreSidebar({
  search,
  onSearchChange,
  languageFilter,
  onLanguageFilterChange,
  onApply,
  onClear,
  hasActiveFilters,
  onSubmitSearch,
}: {
  search: string
  onSearchChange: (v: string) => void
  languageFilter: string | undefined
  onLanguageFilterChange: (v: string | undefined) => void
  onApply: () => void
  onClear: () => void
  hasActiveFilters: boolean
  onSubmitSearch: (e: React.FormEvent) => void
}) {
  return (
    <aside className="flex flex-col gap-6">
      <form onSubmit={onSubmitSearch} className="space-y-2">
        <Label htmlFor="explore-search" className="text-sm font-medium">
          البحث في المستودعات
        </Label>
        <div className="relative">
          <SearchIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="explore-search"
            placeholder="اسم المستودع أو الوصف..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-9 pl-3"
            aria-label="البحث بالاسم أو الوصف"
          />
        </div>
      </form>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">اللغة</Label>
        <p className="text-muted-foreground text-xs">
          اعرض المستودعات التي تستخدم لغة معينة
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={languageFilter === undefined ? "secondary" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => onLanguageFilterChange(undefined)}
          >
            الكل
          </Button>
          {LANGUAGES.map((lang) => (
            <Button
              key={lang}
              type="button"
              variant={languageFilter === lang ? "secondary" : "outline"}
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => onLanguageFilterChange(languageFilter === lang ? undefined : lang)}
            >
              {lang}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-center gap-1 text-muted-foreground"
            onClick={onClear}
          >
            <XIcon className="size-4" />
            مسح التصفية
          </Button>
        )}
        <Button onClick={onApply} className="w-full" size="default">
          تطبيق البحث
        </Button>
      </div>
    </aside>
  )
}

export function ExplorePage() {
  const [repos, setRepos] = useState<RepoWithId[]>([])
  const [ownerProfiles, setOwnerProfiles] = useState<Map<string, UserProfile | null>>(new Map())
  const [loading, setLoading] = useState(true)
  const [loadingPage, setLoadingPage] = useState(false)
  const [search, setSearch] = useState("")
  const [searchApplied, setSearchApplied] = useState("")
  const [languageFilter, setLanguageFilter] = useState<string | undefined>()
  const [languageApplied, setLanguageApplied] = useState<string | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [pagesCache, setPagesCache] = useState<Record<number, PageCache>>({})
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const hasMore = pagesCache[currentPage]?.hasMore ?? false
  const hasActiveFilters = Boolean(searchApplied.trim() || languageApplied)
  const hasPrevious = currentPage > 1

  useEffect(() => {
    const ids = [...new Set(repos.map((r) => r.ownerId))]
    if (ids.length === 0) {
      setOwnerProfiles(new Map())
      return
    }
    getProfilesByIds(ids).then(setOwnerProfiles)
  }, [repos])

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
    try {
      const result: ListPublicReposPageResult = await listPublicReposPage({
        languageFilter: languageApplied,
      })
      setRepos(result.repos)
      setPagesCache({
        1: { repos: result.repos, lastDoc: result.lastDoc, hasMore: result.hasMore },
      })
    } finally {
      setLoading(false)
    }
  }, [searchApplied, languageApplied])

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1 || isSearchMode) return
      const cached = pagesCache[page]
      if (cached) {
        setCurrentPage(page)
        setRepos(cached.repos)
        return
      }
      const prevCache = pagesCache[page - 1]
      if (!prevCache?.lastDoc && page > 1) return
      setLoadingPage(true)
      try {
        const result = await listPublicReposPage({
          languageFilter: languageApplied,
          startAfterDoc: page === 1 ? undefined : prevCache?.lastDoc ?? undefined,
        })
        setPagesCache((prev) => ({
          ...prev,
          [page]: {
            repos: result.repos,
            lastDoc: result.lastDoc,
            hasMore: result.hasMore,
          },
        }))
        setCurrentPage(page)
        setRepos(result.repos)
      } finally {
        setLoadingPage(false)
      }
    },
    [isSearchMode, languageApplied, pagesCache]
  )

  const loadMore = useCallback(async () => {
    if (loadingPage || !hasMore || isSearchMode) return
    const nextPage = currentPage + 1
    await goToPage(nextPage)
  }, [currentPage, hasMore, isSearchMode, loadingPage, goToPage])

  const applyFilters = useCallback(() => {
    setSearchApplied(search)
    setLanguageApplied(languageFilter)
    setSidebarOpen(false)
  }, [search, languageFilter])

  const clearFilters = useCallback(() => {
    setSearch("")
    setSearchApplied("")
    setLanguageFilter(undefined)
    setLanguageApplied(undefined)
  }, [])

  const handleSubmitSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      applyFilters()
    },
    [applyFilters]
  )

  useEffect(() => {
    loadFirstPage()
  }, [loadFirstPage])

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Desktop sidebar - sticky */}
      <div className="hidden w-72 shrink-0 border-l border-border bg-muted/20 md:block">
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-5">
          <h2 className="mb-1 text-base font-semibold text-foreground">البحث والتصفية</h2>
          <p className="text-muted-foreground text-xs mb-4">
            صفّ المستودعات العامة بالاسم أو اللغة
          </p>
          <ExploreSidebar
            search={search}
            onSearchChange={setSearch}
            languageFilter={languageFilter}
            onLanguageFilterChange={setLanguageFilter}
            onApply={applyFilters}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
            onSubmitSearch={handleSubmitSearch}
          />
        </div>
      </div>

      {/* Mobile filter sheet */}
      <div className="md:hidden fixed bottom-4 left-4 z-40">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
              <FilterIcon className="size-5" />
              <span className="sr-only">فتح التصفية</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[320px]">
            <SheetTitle className="text-right pt-2">البحث والتصفية</SheetTitle>
            <div className="pt-4 pb-8">
              <ExploreSidebar
                search={search}
                onSearchChange={setSearch}
                languageFilter={languageFilter}
                onLanguageFilterChange={setLanguageFilter}
                onApply={applyFilters}
                onClear={clearFilters}
                hasActiveFilters={hasActiveFilters}
                onSubmitSearch={handleSubmitSearch}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">استكشف</h1>

        {loading ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <li key={i}>
                <RepoCardSkeleton />
              </li>
            ))}
          </ul>
        ) : repos.length === 0 ? (
          <p className="text-muted-foreground">لا مستودعات عامة.</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {repos.map((repo) => (
                <li key={repo.id}>
                  <RepoCard repo={repo} owner={ownerProfiles.get(repo.ownerId) ?? null} />
                </li>
              ))}
            </ul>
            {!isSearchMode && (hasMore || hasPrevious) && (
              <>
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (hasPrevious) goToPage(currentPage - 1)
                        }}
                        className={
                          !hasPrevious ? "pointer-events-none opacity-50" : undefined
                        }
                        aria-disabled={!hasPrevious}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="flex h-9 items-center justify-center gap-2 px-4 text-sm text-muted-foreground">
                        صفحة {currentPage}
                        {loadingPage && (
                          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        )}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (hasMore) loadMore()
                        }}
                        className={!hasMore ? "pointer-events-none opacity-50" : undefined}
                        aria-disabled={!hasMore}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                {hasMore && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingPage}
                    >
                      {loadingPage ? (
                        <>
                          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          جاري تحميل المزيد...
                        </>
                      ) : (
                        "تحميل المزيد"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
