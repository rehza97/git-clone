import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  History,
  Plus,
  Package,
  Clock,
  BadgeCheck,
  FolderArchive,
  Award,
  ArrowRight,
  ArrowUp,
  Eye,
  Pencil,
  Trash2,
  Zap,
  Code2,
  Braces,
  Terminal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { listReposByOwner, deleteRepo, type RepoWithId } from "@/lib/repos"
import type { Timestamp } from "firebase/firestore"

function formatDate(repo: RepoWithId): string {
  const ts = (repo as RepoWithId & { createdAt?: Timestamp }).createdAt
  if (!ts) return "—"
  const ms = ts.toMillis ? ts.toMillis() : (ts as unknown as { seconds: number }).seconds * 1000
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const PROJECT_ICONS = [
  { Icon: Code2, color: "orange" },
  { Icon: Braces, color: "blue" },
  { Icon: Terminal, color: "purple" },
]

export function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [repos, setRepos] = useState<RepoWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<RepoWithId | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    listReposByOwner(user.uid)
      .then(setRepos)
      .catch(() => setRepos([]))
      .finally(() => setLoading(false))
  }, [user?.uid])

  const totalArchives = repos.length
  const newCount = 0
  const pendingCount = 0
  const issuedCount = repos.length

  function getRepoStatus(index: number): "archived" | "pending" {
    return index === 1 && repos.length >= 2 ? "pending" : "archived"
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteRepo(deleteTarget.id)
      setRepos((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // Firestore rules or network; keep dialog open so user can retry or cancel
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  return (
    <main className="min-h-full flex-1 antialiased bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-8 sm:px-6 lg:px-12">
      {/* Welcome Section */}
      <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="mb-3 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            {t("dashboard.overview")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("dashboard.overviewSubtitle")}
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button
            variant="secondary"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80 sm:w-auto"
          >
            <History className="h-[18px] w-[18px]" />
            {t("dashboard.recentActivity")}
          </Button>
          <Link to="/create-project" className="w-full sm:w-auto">
            <Button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-all shadow-primary/25 sm:w-auto">
              <Plus className="h-[18px] w-[18px]" />
              {t("dashboard.newSubmission")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex h-32 flex-col justify-between rounded-xl border border-border-strong bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-medium">{t("dashboard.totalArchives")}</span>
            <Package className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{totalArchives}</span>
            {newCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                <ArrowUp className="h-3 w-3" />
                {t("dashboard.newCount", { count: newCount })}
              </span>
            )}
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between rounded-xl border border-border-strong bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-medium">{t("dashboard.pendingApprovals")}</span>
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{pendingCount}</span>
            <span className="text-xs font-medium text-muted-foreground">{t("dashboard.inReview")}</span>
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between rounded-xl border border-border-strong bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-medium">{t("dashboard.issuedCertificates")}</span>
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{issuedCount}</span>
            <span className="text-xs font-medium text-muted-foreground">{t("dashboard.valid")}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
        <Zap className="h-5 w-5 text-primary" />
        {t("dashboard.quickActions")}
      </h3>
      <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
          <div className="absolute right-0 top-0 p-6 text-primary opacity-10 transition-opacity group-hover:opacity-20">
            <FolderArchive className="h-[120px] w-[120px] rotate-12" />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-8">
            <div>
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <FolderArchive className="h-7 w-7" />
              </div>
              <h4 className="mb-2 text-2xl font-bold text-foreground">{t("dashboard.archiveNewProject")}</h4>
              <p className="max-w-sm leading-relaxed text-muted-foreground">
                {t("dashboard.archiveNewProjectDesc")}
              </p>
            </div>
            <Link to="/create-project">
              <Button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:opacity-90 sm:w-auto"
              >
                {t("dashboard.startArchiveProcess")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
          <div className="absolute right-0 top-0 p-6 text-primary opacity-10 transition-opacity group-hover:opacity-20">
            <Award className="h-[120px] w-[120px] -rotate-12" />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-8">
            <div>
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Award className="h-7 w-7" />
              </div>
              <h4 className="mb-2 text-2xl font-bold text-foreground">{t("dashboard.requestCertificate")}</h4>
              <p className="max-w-sm leading-relaxed text-muted-foreground">
                {t("dashboard.requestCertificateDesc")}
              </p>
            </div>
            <Button asChild variant="secondary" className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-600 sm:w-auto">
              <Link to="/certificates">
                {t("dashboard.viewEligibleProjects")}
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      {/* Recent Submissions Table — anchor target for "View all" (scroll into view on long pages) */}
      <div
        id="dashboard-recent-submissions"
        className="scroll-mt-6 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-border-strong px-6 py-4">
          <h3 className="font-bold text-foreground">{t("dashboard.recentSubmissions")}</h3>
          <a
            href="#dashboard-recent-submissions"
            className="text-sm font-medium text-primary hover:opacity-80"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById("dashboard-recent-submissions")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }}
          >
            {t("dashboard.viewAll")}
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">{t("dashboard.projectName")}</th>
                <th className="px-6 py-3 font-medium">{t("dashboard.date")}</th>
                <th className="px-6 py-3 font-medium">{t("dashboard.status")}</th>
                <th className="px-6 py-3 font-medium text-right">{t("dashboard.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-strong">
              {repos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    {t("dashboard.noRepos")}
                  </td>
                </tr>
              ) : (
                repos.map((repo, index) => {
                  const status = getRepoStatus(index)
                  const { Icon, color } = PROJECT_ICONS[index % PROJECT_ICONS.length]
                  const colorClasses = color === "orange" ? "bg-orange-500/10 text-orange-500" : color === "blue" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                  return (
                    <tr key={repo.id} className="transition-colors hover:bg-muted/50">
                      <td className="flex items-center gap-3 px-6 py-4 font-medium text-foreground">
                        <div className={`flex size-8 items-center justify-center rounded ${colorClasses}`}>
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <Link to={`/repo/${repo.id}`} className="hover:underline">{repo.name}</Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(repo)}</td>
                      <td className="px-6 py-4">
                        {status === "archived" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {t("dashboard.archived")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            {t("dashboard.pendingReview")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" asChild>
                            <Link to={`/repo/${repo.id}`} title={t("dashboard.details")} aria-label={t("dashboard.details")}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" asChild>
                            <Link to={`/repo/${repo.id}/upload`} title={t("dashboard.edit")} aria-label={t("dashboard.edit")}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            title={t("dashboard.delete")}
                            aria-label={t("dashboard.delete")}
                            onClick={() => setDeleteTarget(repo)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleting(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.deleteRepoTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? t("dashboard.deleteRepoMessage", { name: deleteTarget.name }) : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("common.cancel")}</AlertDialogCancel>
            <Button variant="destructive" disabled={deleting} onClick={() => void handleConfirmDelete()}>
              {deleting ? t("dashboard.deleting") : t("dashboard.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </main>
  )
}
