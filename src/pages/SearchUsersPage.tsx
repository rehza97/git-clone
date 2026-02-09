import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { listUserProfiles, type UserProfileWithId } from "@/lib/users"
import { SearchIcon } from "lucide-react"

const SKELETON_COUNT = 6

function ProfileCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Skeleton className="size-14 rounded-full shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileCard({ profile }: { profile: UserProfileWithId }) {
  const displayName = profile.displayName || profile.username || "—"
  const username = profile.username

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar size="lg" className="size-14 shrink-0">
            {profile.photoURL && <AvatarImage src={profile.photoURL} alt="" />}
            <AvatarFallback className="text-lg">
              {(profile.displayName || profile.username || "?")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground truncate">{displayName}</p>
            {username && (
              <p className="text-muted-foreground text-sm truncate">@{username}</p>
            )}
            {profile.bio && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                {profile.bio}
              </p>
            )}
            {username && (
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to={`/${username}`}>عرض الملف</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SearchUsersPage() {
  const [profiles, setProfiles] = useState<UserProfileWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    listUserProfiles({ limitCount: 80 })
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles
    const term = search.trim().toLowerCase()
    return profiles.filter(
      (p) =>
        (p.username ?? "").toLowerCase().includes(term) ||
        (p.displayName ?? "").toLowerCase().includes(term) ||
        (p.bio ?? "").toLowerCase().includes(term)
    )
  }, [profiles, search])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">بحث المستخدمين</h1>
      <p className="text-muted-foreground text-sm mb-6">
        ابحث عن ملفات المستخدمين بالاسم أو اسم المستخدم أو النبذة
      </p>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mb-8 max-w-md"
      >
        <Label htmlFor="users-search" className="sr-only">
          البحث عن مستخدمين
        </Label>
        <div className="relative">
          <SearchIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="users-search"
            type="search"
            placeholder="اسم المستخدم أو الاسم المعروض..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3"
            autoComplete="off"
          />
        </div>
      </form>

      {loading ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <li key={i}>
              <ProfileCardSkeleton />
            </li>
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">
          {search.trim() ? "لا مستخدمين يطابقون البحث." : "لا مستخدمين مسجلين بعد."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((profile) => (
            <li key={profile.userId}>
              <ProfileCard profile={profile} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
