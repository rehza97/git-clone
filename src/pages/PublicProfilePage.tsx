import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { findUserIdByUsername, getUserProfile } from "@/lib/users"
import { listPublicReposByOwner } from "@/lib/repos"
import type { UserProfile } from "@/types/schema"
import type { RepoWithId } from "@/lib/repos"

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [repos, setRepos] = useState<RepoWithId[]>([])
  const [loading, setLoading] = useState(!!username)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) {
      console.log("[Profile/Page] no username in URL, set notFound")
      setNotFound(true)
      setLoading(false)
      return
    }
    console.log("[Profile/Page] loading profile for username:", username)
    setLoading(true)
    setNotFound(false)
    findUserIdByUsername(username)
      .then((uid) => {
        console.log("[Profile/Page] findUserIdByUsername result:", uid ?? "null")
        if (!uid) {
          console.log("[Profile/Page] no uid, set notFound")
          setNotFound(true)
          setProfile(null)
          setRepos([])
          return
        }
        return Promise.all([
          getUserProfile(uid),
          listPublicReposByOwner(uid),
        ]).then(([p, r]) => {
          console.log("[Profile/Page] got profile:", !!p, "repos:", r?.length ?? 0)
          if (!p) console.log("[Profile/Page] getUserProfile returned null for uid:", uid)
          setProfile(p ?? null)
          setRepos(r ?? [])
        })
      })
      .catch((err) => {
        console.error("[Profile/Page] error loading profile:", err)
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">المستخدم غير موجود.</p>
        <Button variant="link" asChild>
          <Link to="/">العودة للرئيسية</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{profile.displayName || profile.username}</h1>
        <p className="text-muted-foreground">@{profile.username}</p>
        {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
      </div>
      <h2 className="mb-4 font-semibold">المستودعات العامة</h2>
      {repos.length === 0 ? (
        <p className="text-muted-foreground">لا مستودعات عامة.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <li key={repo.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar size="sm" className="size-6">
                      {profile.photoURL && <AvatarImage src={profile.photoURL} alt="" />}
                      <AvatarFallback className="text-xs">
                        {(profile.displayName || profile.username || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      to={`/${profile.username}`}
                      className="text-muted-foreground hover:text-foreground text-sm truncate"
                    >
                      {profile.displayName || profile.username}
                    </Link>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
