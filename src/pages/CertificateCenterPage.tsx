import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ShieldCheck,
  Database,
  BadgeCheck,
  FolderArchive,
  Terminal,
  Braces,
  Code,
  Download,
  ArrowRight,
  Info,
  ClipboardCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { listReposByOwner, type RepoWithId } from "@/lib/repos"
import type { Timestamp } from "firebase/firestore"

function toCertId(repoId: string): string {
  const clean = repoId.replace(/-/g, "").slice(0, 5)
  const a = clean.toUpperCase()
  const last = repoId.slice(-1).toUpperCase()
  return `ASC-${a}${last}`.slice(0, 7)
}

function formatArchivalDate(repo: RepoWithId): string {
  const ts = (repo as RepoWithId & { createdAt?: Timestamp }).createdAt
  if (!ts) return "—"
  const d = ts.toMillis ? ts.toMillis() : (ts as unknown as { seconds: number }).seconds * 1000
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function lastUpdatedString(): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = now.getTime() - today.getTime()
  if (diff >= 0 && diff < 24 * 60 * 60 * 1000) {
    const time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    return `Today, ${time}`
  }
  return now.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

const REPO_ICONS = [FolderArchive, Terminal, Braces, Code]

export function CertificateCenterPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [repos, setRepos] = useState<RepoWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyId, setVerifyId] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    setLastUpdated(lastUpdatedString())
    listReposByOwner(user.uid)
      .then(setRepos)
      .catch(() => setRepos([]))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login")
    }
  }, [user, loading, navigate])

  function handleVerify() {
    const id = verifyId.trim()
    if (!id) return
    const byCertId = repos.find((r) => toCertId(r.id) === id)
    if (byCertId) {
      navigate(`/repo/${byCertId.id}/certificate`)
      return
    }
    const byRepoId = id.replace(/^ASCAP-CERT-/, "").replace(/^ASC-/, "")
    if (repos.some((r) => r.id === byRepoId)) {
      navigate(`/repo/${byRepoId}/certificate`)
      return
    }
    navigate(`/repo/${id}/certificate`)
  }

  if (!user) return null

  const totalCerts = repos.length
  const digitalAssets = "—"
  const externalVerifications = "0"

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-page font-sans text-foreground antialiased">
      <main className="mx-auto flex flex-1 justify-center px-4 py-8 sm:px-8">
        <div className="flex w-full max-w-[1200px] flex-col gap-8">
          {/* Page Title */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground md:text-4xl">
                {t("certificateCenter.title")}
              </h1>
              <p className="max-w-2xl text-base font-normal text-subtle-fg">
                {t("certificateCenter.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-subtle-fg">
                {t("certificateCenter.lastUpdated", { date: lastUpdated })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1 rounded-xl border border-border-strong bg-surface p-6 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <BadgeCheck className="h-7 w-7 text-primary" />
                <p className="text-sm font-medium uppercase tracking-wide text-subtle-fg">
                  {t("certificateCenter.totalCertificates")}
                </p>
              </div>
              <p className="text-3xl font-bold leading-tight text-foreground">{totalCerts}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border-strong bg-surface p-6 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <Database className="h-7 w-7 text-primary" />
                <p className="text-sm font-medium uppercase tracking-wide text-subtle-fg">
                  {t("certificateCenter.digitalAssetsSecured")}
                </p>
              </div>
              <p className="text-3xl font-bold leading-tight text-foreground">{digitalAssets}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border-strong bg-surface p-6 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <ClipboardCheck className="h-7 w-7 text-primary" />
                <p className="text-sm font-medium uppercase tracking-wide text-subtle-fg">
                  {t("certificateCenter.externalVerifications")}
                </p>
              </div>
              <p className="text-3xl font-bold leading-tight text-foreground">{externalVerifications}</p>
            </div>
          </div>

          {/* Grid: List + Verification */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Certificate List */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{t("certificateCenter.recentCertificates")}</h2>
                <button
                  type="button"
                  className="text-sm font-bold text-primary hover:underline"
                  onClick={() => {}}
                >
                  {t("certificateCenter.viewAllHistory")}
                </button>
              </div>
              <div className="flex flex-col overflow-hidden rounded-xl border border-border-strong bg-surface">
                {/* Table header */}
                <div
                  className="grid grid-cols-12 gap-4 border-b border-border-strong bg-surface-muted/80 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-subtle-fg"
                >
                  <div className="col-span-6 sm:col-span-5">{t("certificateCenter.repositoryName")}</div>
                  <div className="col-span-3 sm:col-span-3">{t("certificateCenter.archivalDate")}</div>
                  <div className="col-span-3 sm:col-span-2">{t("certificateCenter.id")}</div>
                  <div className="hidden text-right sm:col-span-2 sm:block">{t("certificateCenter.action")}</div>
                </div>
                {loading ? (
                  <div className="px-6 py-8 text-center text-sm text-subtle-fg">
                    {t("certificate.loading")}
                  </div>
                ) : repos.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-subtle-fg">
                    No certificates yet. Upload code to a repository to generate one.
                  </div>
                ) : (
                  repos.map((repo, index) => {
                    const Icon = REPO_ICONS[index % REPO_ICONS.length]
                    const certId = toCertId(repo.id)
                    const isLast = index === repos.length - 1
                    return (
                      <div
                        key={repo.id}
                        className={`group grid grid-cols-12 gap-4 items-center border-b border-border-strong px-6 py-4 transition-colors hover:bg-border-strong/30 ${isLast ? "border-b-0" : ""}`}
                      >
                        <div className="col-span-6 flex min-w-0 items-center gap-3 sm:col-span-5">
                          <div
                            className="flex size-10 shrink-0 items-center justify-center rounded bg-primary/20 text-primary"
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <p className="truncate font-medium text-foreground">{repo.name}</p>
                            <p className="text-xs text-subtle-fg">
                              archived
                            </p>
                          </div>
                        </div>
                        <div className="col-span-3 text-sm text-subtle-fg sm:col-span-3">
                          {formatArchivalDate(repo)}
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <span
                            className="inline-flex items-center rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-subtle-fg ring-1 ring-inset ring-border-strong/20"
                          >
                            {certId}
                          </span>
                        </div>
                        <div className="col-span-12 flex justify-end sm:col-span-2">
                          <Link
                            to={`/repo/${repo.id}/certificate`}
                            className="flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:opacity-80"
                          >
                            <Download className="h-5 w-5" />
                            <span className="hidden sm:inline">{t("certificateCenter.downloadPdf")}</span>
                          </Link>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right: Verification Tool */}
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-foreground">{t("certificateCenter.publicVerification")}</h2>
              <div
                className="relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground shadow-lg"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/20 blur-3xl" />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-2xl font-bold leading-tight">{t("certificateCenter.verifyTitle")}</h3>
                    <p className="text-sm leading-relaxed text-blue-100">
                      {t("certificateCenter.verifyDesc")}
                    </p>
                  </div>
                  <div className="h-px w-full bg-white/20" />
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                      {t("certificateCenter.certificateIdLabel")}
                    </span>
                    <div className="flex w-full items-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm transition-all focus-within:border-white/50 focus-within:bg-white/20">
                      <Input
                        value={verifyId}
                        onChange={(e) => setVerifyId(e.target.value)}
                        placeholder={t("certificateCenter.certificateIdPlaceholder")}
                        className="border-none bg-transparent p-3 text-base font-mono text-white placeholder:text-blue-200/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </label>
                  <Button
                    onClick={handleVerify}
                    className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white font-bold text-primary shadow-md transition-all hover:bg-slate-100"
                  >
                    {t("certificateCenter.verifyNow")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative z-10 mt-auto pt-8">
                  <div className="flex items-center gap-3 rounded-lg bg-black/20 p-3 backdrop-blur-sm">
                    <Info className="h-5 w-5 shrink-0 text-blue-200" />
                    <p className="text-xs leading-snug text-blue-100">
                      {t("certificateCenter.verificationNote")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-border-strong pt-8 pb-8 md:flex-row">
            <p className="text-sm text-subtle-fg">
              {t("certificateCenter.footerCopyright")}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-subtle-fg transition-colors hover:opacity-80" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
              <a href="#" className="text-subtle-fg transition-colors hover:opacity-80" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>
              <Link to="/support" className="text-subtle-fg transition-colors hover:opacity-80">
                Support
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
