import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"
import { listReposByOwner, createRepo, type RepoWithId } from "@/lib/repos"
import type { RepoVisibility } from "@/types/schema"

export function DashboardPage() {
  const { user } = useAuth()
  const profile = useUserProfile()
  const [repos, setRepos] = useState<RepoWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<RepoVisibility>("private")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) return
    listReposByOwner(user.uid)
      .then(setRepos)
      .catch(() => setRepos([]))
      .finally(() => setLoading(false))
  }, [user?.uid])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    setCreating(true)
    try {
      await createRepo(user.uid, { name: name.trim(), description: description.trim() || undefined, visibility })
      const list = await listReposByOwner(user.uid)
      setRepos(list)
      setName("")
      setDescription("")
      setVisibility("private")
      setDialogOpen(false)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>إنشاء مستودع</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء مستودع جديد</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label htmlFor="repo-name">الاسم</Label>
                <Input
                  id="repo-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسم المستودع"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repo-desc">الوصف (اختياري)</Label>
                <Textarea
                  id="repo-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف قصير"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>الظهور</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as RepoVisibility)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">عام</SelectItem>
                    <SelectItem value="private">خاص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {repos.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>لا مستودعات بعد</CardTitle>
            <CardDescription>أنشئ مستودعاً وابدأ برفع ملفاتك.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setDialogOpen(true)}>إنشاء أول مستودع</Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <li key={repo.id}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {profile && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar size="sm" className="size-6">
                          {profile.photoURL && <AvatarImage src={profile.photoURL} alt="" />}
                          <AvatarFallback className="text-xs">
                            {(profile.displayName || profile.username || "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground text-sm truncate">
                          {profile.displayName || profile.username}
                        </span>
                      </div>
                    )}
                    <CardTitle className="truncate">
                      <Link to={`/repo/${repo.id}`} className="hover:underline">
                        {repo.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {repo.description || "—"}
                    </CardDescription>
                  </div>
                  <Badge variant={repo.visibility === "public" ? "default" : "secondary"}>
                    {repo.visibility === "public" ? "عام" : "خاص"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/repo/${repo.id}`}>عرض</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/repo/${repo.id}/upload`}>رفع</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
