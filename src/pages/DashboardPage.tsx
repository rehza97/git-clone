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
  Download,
  Pencil,
  Zap,
  Code2,
  Braces,
  Terminal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { listReposByOwner, type RepoWithId } from "@/lib/repos"
import type { Timestamp } from "firebase/firestore"

const PRIMARY = "#1173d4"

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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  return (
    <main className="min-h-full flex-1 antialiased bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-12">
      {/* Welcome Section */}
      <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="mb-3 text-3xl font-black tracking-tight text-white md:text-4xl">
            {t("dashboard.overview")}
          </h2>
          <p className="text-lg text-slate-400">
            {t("dashboard.overviewSubtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            <History className="h-[18px] w-[18px]" />
            {t("dashboard.recentActivity")}
          </Button>
          <Link to="/create-project">
            <Button
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all"
              style={{ backgroundColor: PRIMARY, boxShadow: `0 10px 15px -3px ${PRIMARY}40` }}
            >
              <Plus className="h-[18px] w-[18px]" />
              {t("dashboard.newSubmission")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex h-32 flex-col justify-between rounded-xl border border-slate-800 bg-[#1a2634] p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">{t("dashboard.totalArchives")}</span>
            <Package className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalArchives}</span>
            {newCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                <ArrowUp className="h-3 w-3" />
                {t("dashboard.newCount", { count: newCount })}
              </span>
            )}
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between rounded-xl border border-slate-800 bg-[#1a2634] p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">{t("dashboard.pendingApprovals")}</span>
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{pendingCount}</span>
            <span className="text-xs font-medium text-slate-500">{t("dashboard.inReview")}</span>
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between rounded-xl border border-slate-800 bg-[#1a2634] p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">{t("dashboard.issuedCertificates")}</span>
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{issuedCount}</span>
            <span className="text-xs font-medium text-slate-500">{t("dashboard.valid")}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
        <Zap className="h-5 w-5" style={{ color: PRIMARY }} />
        {t("dashboard.quickActions")}
      </h3>
      <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#1a2634] shadow-md transition-all duration-300 hover:border-[#1173d4]/50 hover:shadow-xl">
          <div className="absolute right-0 top-0 p-6 opacity-10 transition-opacity group-hover:opacity-20" style={{ color: PRIMARY }}>
            <FolderArchive className="h-[120px] w-[120px] rotate-12" />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-8">
            <div>
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-[#1173d4] group-hover:text-white" style={{ color: PRIMARY }}>
                <FolderArchive className="h-7 w-7" />
              </div>
              <h4 className="mb-2 text-2xl font-bold text-white">{t("dashboard.archiveNewProject")}</h4>
              <p className="max-w-sm leading-relaxed text-slate-400">
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
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1173d4] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#1a2634] shadow-md transition-all duration-300 hover:border-[#1173d4]/50 hover:shadow-xl">
          <div className="absolute right-0 top-0 p-6 opacity-10 transition-opacity group-hover:opacity-20" style={{ color: PRIMARY }}>
            <Award className="h-[120px] w-[120px] -rotate-12" />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-8">
            <div>
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-[#1173d4] group-hover:text-white" style={{ color: PRIMARY }}>
                <Award className="h-7 w-7" />
              </div>
              <h4 className="mb-2 text-2xl font-bold text-white">{t("dashboard.requestCertificate")}</h4>
              <p className="max-w-sm leading-relaxed text-slate-400">
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
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1173d4] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#1a2634] shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="font-bold text-white">{t("dashboard.recentSubmissions")}</h3>
          <Link to="/dashboard" className="text-sm font-medium hover:opacity-80" style={{ color: PRIMARY }}>
            {t("dashboard.viewAll")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#151f2b] text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">{t("dashboard.projectName")}</th>
                <th className="px-6 py-3 font-medium">{t("dashboard.date")}</th>
                <th className="px-6 py-3 font-medium">{t("dashboard.status")}</th>
                <th className="px-6 py-3 font-medium text-right">{t("dashboard.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {repos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    {t("dashboard.noRepos")}
                  </td>
                </tr>
              ) : (
                repos.map((repo, index) => {
                  const status = getRepoStatus(index)
                  const { Icon, color } = PROJECT_ICONS[index % PROJECT_ICONS.length]
                  const colorClasses = color === "orange" ? "bg-orange-500/10 text-orange-500" : color === "blue" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                  return (
                    <tr key={repo.id} className="transition-colors hover:bg-slate-800/50">
                      <td className="flex items-center gap-3 px-6 py-4 font-medium text-white">
                        <div className={`flex size-8 items-center justify-center rounded ${colorClasses}`}>
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <Link to={`/repo/${repo.id}`} className="hover:underline">{repo.name}</Link>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(repo)}</td>
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
                        {status === "archived" ? (
                          <Link to={`/repo/${repo.id}/certificate`} className="text-slate-400 transition-colors hover:text-[#1173d4]" aria-label="Download certificate">
                            <Download className="inline-block h-5 w-5" />
                          </Link>
                        ) : (
                          <Link to={`/repo/${repo.id}/upload`} className="text-slate-400 transition-colors hover:text-[#1173d4]" aria-label="Edit">
                            <Pencil className="inline-block h-5 w-5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </main>
  )
}
