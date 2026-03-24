import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  UserX,
  Home,
  Search,
  Upload,
  Building2,
  MapPin,
  Users,
  Info,
  BookOpen,
  FolderOpen,
  Star,
  LayoutGrid,
  GraduationCap,
  FileText,
  GitCommit,
  CheckCircle2,
  Archive,
  GitBranch,
  Sparkles,
} from "lucide-react"
import { findUserIdByUsername, getUserProfile } from "@/lib/users"
import { listPublicReposByOwner } from "@/lib/repos"
import type { UserProfile } from "@/types/schema"
import type { RepoWithId } from "@/lib/repos"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const CARD_DARK = "#16202a"
const CARD_BORDER = "#233648"
const TEXT_SECONDARY = "#92adc9"
const BG_DARK = "#101922"

const LANG_COLORS: Record<string, string> = {
  Python: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  TypeScript: "bg-blue-400",
  TeX: "bg-green-600",
  Go: "bg-cyan-400",
  Java: "bg-red-500",
  "C++": "bg-blue-600",
  JSON: "bg-slate-400",
}

function langColor(lang: string): string {
  return LANG_COLORS[lang] ?? "bg-primary"
}

type TabId = "overview" | "repositories" | "decision1275" | "activity"

/** Mock preserved project for Decision 1275 */
const MOCK_PRESERVED = [
  { id: "1", title: "Start-up: Smart Irrigation DZ", desc: "IoT system for arid regions agriculture optimization.", date: "Oct 24, 2026", status: "patented" as const },
  { id: "2", title: "EdTech: School Management V2", desc: "Comprehensive ERP for secondary schools.", date: "Sep 15, 2026", status: "label" as const },
  { id: "3", title: "AI: Traffic Control Algiers", desc: "Computer vision for traffic light optimization.", date: "Jun 02, 2026", status: "pending" as const },
]

/** Mock activity items */
const MOCK_ACTIVITY = [
  { id: "1", type: "commit" as const, time: "Today", textKey: "publicProfile.activityPushed", linkText: "usthb-thesis-template", detail: "8a2b4c Update bibliography style to IEEE" },
  { id: "2", type: "verified" as const, time: "Yesterday", textKey: "publicProfile.activityLabel", linkText: "Smart Irrigation DZ" },
  { id: "3", type: "star" as const, time: "3 days ago", textKey: "publicProfile.activityStarred", linkText: "algeria-hightech/startup-laws-docs" },
]

export function PublicProfilePage() {
  const { t } = useTranslation()
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [repos, setRepos] = useState<RepoWithId[]>([])
  const [loading, setLoading] = useState(!!username)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  useEffect(() => {
    if (!username) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    findUserIdByUsername(username)
      .then((uid) => {
        if (!uid) {
          setNotFound(true)
          setProfile(null)
          setRepos([])
          return
        }
        return Promise.all([
          getUserProfile(uid),
          listPublicReposByOwner(uid),
        ]).then(([p, r]) => {
          setProfile(p ?? null)
          setRepos(r ?? [])
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" style={{ backgroundColor: BG_DARK }}>
        <p className="text-[#92adc9]">{t("common.loading")}</p>
      </div>
    )
  }

  if (notFound || !profile) {
    const isUploadPath = username?.toLowerCase() === "upload"
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: BG_DARK }}>
        <Card className="w-full max-w-md border-[#233648] shadow-lg" style={{ backgroundColor: CARD_DARK }}>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#233648] text-[#92adc9]">
              <UserX className="h-8 w-8" />
            </div>
            <CardTitle className="mt-4 text-xl text-white">{t("users.userNotFound")}</CardTitle>
            <CardDescription className="text-[#92adc9]">
              {t("users.userNotFoundHint")}
              {username && <span className="mt-1 block font-mono text-sm">@{username}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isUploadPath && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                  <Upload className="h-4 w-4 shrink-0" />
                  {t("users.userNotFoundUploadHint")}
                </p>
                <Button asChild size="sm" className="mt-2 w-fit gap-1.5">
                  <Link to="/upload">
                    <Upload className="h-4 w-4" />
                    {t("upload.archiveAndUpload")}
                  </Link>
                </Button>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="gap-1.5 border-[#233648] text-[#92adc9] hover:bg-[#233648] hover:text-white">
                <Link to="/explore">
                  <Search className="h-4 w-4" />
                  {t("nav.explore")}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="gap-1.5 border-[#233648] text-[#92adc9] hover:bg-[#233648] hover:text-white">
                <Link to="/users">{t("users.searchTitle")}</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="gap-1.5 text-[#92adc9] hover:text-white">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  {t("common.backToHome")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = profile.displayName || profile.username
  const pinnedRepos = repos.slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen text-slate-100" style={{ backgroundColor: BG_DARK }}>
      <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col max-w-[1200px] w-full gap-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left: Avatar & meta */}
            <div className="flex-shrink-0 md:sticky md:top-8 w-full md:w-[280px]">
              <div className="relative group">
                <div className="w-full aspect-square max-w-[280px] mx-auto md:mx-0 rounded-full overflow-hidden border-4 shadow-xl relative z-10 mb-4" style={{ borderColor: CARD_DARK, backgroundColor: CARD_DARK }}>
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={profile.photoURL} alt="" className="object-cover" />
                    <AvatarFallback className="text-2xl bg-[#233648] text-[#92adc9]">
                      {(displayName || "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent -m-1 -z-0 blur-md max-w-[280px] mx-auto md:mx-0 left-0 right-0 md:left-0 md:right-auto" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{displayName}</h1>
              <p className="text-lg mb-4" style={{ color: TEXT_SECONDARY }}>@{profile.username}</p>
              {profile.bio && (
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{profile.bio}</p>
              )}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_SECONDARY }}>
                  <Building2 className="size-[18px] shrink-0" />
                  <span>{t("publicProfile.organization")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_SECONDARY }}>
                  <MapPin className="size-[18px] shrink-0" />
                  <span>{t("publicProfile.location")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_SECONDARY }}>
                  <Users className="size-[18px] shrink-0" />
                  <span><span className="text-white font-bold">—</span> {t("publicProfile.followers")} · <span className="text-white font-bold">—</span> {t("publicProfile.following")}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button className="w-full h-9 rounded-lg text-sm font-medium border transition-colors" style={{ backgroundColor: CARD_DARK, borderColor: CARD_BORDER }}>
                  {t("publicProfile.follow")}
                </Button>
                <button type="button" className="w-full h-9 flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:text-primary" style={{ color: TEXT_SECONDARY }}>
                  <Info className="size-4" />
                  {t("publicProfile.moreInfo")}
                </button>
              </div>
              <div className="mt-8 border-t pt-6" style={{ borderColor: CARD_BORDER }}>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t("publicProfile.organizations")}</h3>
                <div className="flex gap-2 flex-wrap">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center overflow-hidden bg-white/10 border border-[#233648]">
                    <GraduationCap className="size-5 text-[#92adc9]" />
                  </div>
                  <div className="w-9 h-9 rounded-md flex items-center justify-center overflow-hidden bg-primary/20 border border-primary/30">
                    <Sparkles className="size-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Stats + Tabs + Content */}
            <div className="flex-1 min-w-0">
              {/* Stats */}
              <div className="bg-gradient-to-br rounded-xl p-6 mb-8 relative overflow-hidden border border-[#233648]" style={{ background: `linear-gradient(to bottom right, ${CARD_DARK}, #0f151b)` }}>
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <GraduationCap className="size-36" />
                </div>
                <div className="relative z-10">
                  <div className="flex flex-col gap-2 mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {t("publicProfile.statsTitle")}
                      <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/20">{t("publicProfile.verified")}</span>
                    </h2>
                    <p className="text-sm max-w-2xl" style={{ color: TEXT_SECONDARY }}>
                      {t("publicProfile.statsDesc")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg p-4 backdrop-blur-sm border border-[#233648] bg-[#101922]/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                          <Archive className="size-5" />
                        </div>
                        <span className="text-2xl font-bold text-white">{repos.length}</span>
                      </div>
                      <p className="text-sm font-medium text-white">{t("publicProfile.statPreserved")}</p>
                      <p className="text-xs mt-1" style={{ color: TEXT_SECONDARY }}>{t("publicProfile.statPreservedHint")}</p>
                    </div>
                    <div className="rounded-lg p-4 backdrop-blur-sm border border-[#233648] bg-[#101922]/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                          <FileText className="size-5" />
                        </div>
                        <span className="text-2xl font-bold text-white">—</span>
                      </div>
                      <p className="text-sm font-medium text-white">{t("publicProfile.statPapers")}</p>
                      <p className="text-xs mt-1" style={{ color: TEXT_SECONDARY }}>{t("publicProfile.statPapersHint")}</p>
                    </div>
                    <div className="rounded-lg p-4 backdrop-blur-sm border border-[#233648] bg-[#101922]/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                          <GitCommit className="size-5" />
                        </div>
                        <span className="text-2xl font-bold text-white">—</span>
                      </div>
                      <p className="text-sm font-medium text-white">{t("publicProfile.statCommits")}</p>
                      <p className="text-xs mt-1" style={{ color: TEXT_SECONDARY }}>{t("publicProfile.statCommitsHint")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b mb-6" style={{ borderColor: CARD_BORDER }}>
                <nav aria-label="Tabs" className="-mb-px flex flex-wrap gap-4 sm:space-x-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === "overview" ? "border-primary text-white" : "border-transparent hover:text-white hover:border-gray-300"}`}
                    style={activeTab !== "overview" ? { color: TEXT_SECONDARY } : undefined}
                  >
                    <LayoutGrid className="size-5" />
                    {t("publicProfile.tabOverview")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("repositories")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === "repositories" ? "border-primary text-white" : "border-transparent hover:text-white hover:border-gray-300"}`}
                    style={activeTab !== "repositories" ? { color: TEXT_SECONDARY } : undefined}
                  >
                    <FolderOpen className="size-5" />
                    {t("publicProfile.tabRepositories")}
                    <span className="ml-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: CARD_BORDER }}>{repos.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("decision1275")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === "decision1275" ? "border-primary text-white" : "border-transparent hover:text-white hover:border-gray-300"}`}
                    style={activeTab !== "decision1275" ? { color: TEXT_SECONDARY } : undefined}
                  >
                    <Star className="size-5" />
                    {t("publicProfile.tabDecision1275")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("activity")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === "activity" ? "border-primary text-white" : "border-transparent hover:text-white hover:border-gray-300"}`}
                    style={activeTab !== "activity" ? { color: TEXT_SECONDARY } : undefined}
                  >
                    <GitBranch className="size-5" />
                    {t("publicProfile.tabActivity")}
                  </button>
                </nav>
              </div>

              {/* Tab content */}
              {activeTab === "overview" && (
                <>
                  {/* Pinned Repositories */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{t("publicProfile.pinnedRepos")}</h3>
                      <span className="text-xs text-primary hover:underline cursor-pointer">{t("publicProfile.customizePins")}</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {pinnedRepos.length === 0 ? (
                        <p className="text-sm col-span-2" style={{ color: TEXT_SECONDARY }}>{t("publicProfile.noPinnedRepos")}</p>
                      ) : (
                        pinnedRepos.map((repo) => (
                          <Link
                            key={repo.id}
                            to={`/repo/${repo.id}`}
                            className="rounded-lg p-4 border border-[#233648] hover:border-[#92adc9]/50 transition-colors cursor-pointer group block"
                            style={{ backgroundColor: CARD_DARK }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="size-5 shrink-0 group-hover:text-primary transition-colors" style={{ color: TEXT_SECONDARY }} />
                              <span className="text-primary font-bold hover:underline truncate">{repo.name}</span>
                              <span className="border rounded-full px-2 py-0.5 text-xs flex-shrink-0" style={{ borderColor: CARD_BORDER, color: TEXT_SECONDARY }}>
                                {repo.visibility === "public" ? t("common.public") : t("common.private")}
                              </span>
                            </div>
                            <p className="text-sm mb-4 line-clamp-2" style={{ color: TEXT_SECONDARY }}>{repo.description || "—"}</p>
                            <div className="flex items-center gap-4 text-xs" style={{ color: TEXT_SECONDARY }}>
                              {repo.languages?.[0] && (
                                <div className="flex items-center gap-1">
                                  <span className={`w-3 h-3 rounded-full ${langColor(repo.languages[0])}`} />
                                  <span>{repo.languages[0]}</span>
                                </div>
                              )}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Preserved Projects (Decision 1275) */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{t("publicProfile.preservedProjects")}</h3>
                      <span className="text-xs text-primary hover:underline cursor-pointer">{t("publicProfile.viewAll")}</span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-[#233648]" style={{ backgroundColor: CARD_DARK }}>
                      <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-4 p-4 border-b border-[#233648] text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_SECONDARY }}>
                        <div>{t("publicProfile.project")}</div>
                        <div className="text-right hidden sm:block">{t("publicProfile.dateArchived")}</div>
                        <div className="text-right">{t("publicProfile.status")}</div>
                      </div>
                      {MOCK_PRESERVED.map((row) => (
                        <div key={row.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-4 p-4 border-b border-[#233648] hover:bg-[#101922]/50 transition-colors items-center last:border-b-0">
                          <div className="flex gap-3">
                            <div className="mt-1">
                              {row.status === "patented" ? (
                                <CheckCircle2 className="size-5 text-green-500" />
                              ) : (
                                <Archive className="size-5" style={{ color: TEXT_SECONDARY }} />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white hover:text-primary cursor-pointer">{row.title}</h4>
                              <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>{row.desc}</p>
                            </div>
                          </div>
                          <div className="text-sm text-right hidden sm:block" style={{ color: TEXT_SECONDARY }}>{row.date}</div>
                          <div className="text-right flex justify-end">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              row.status === "patented" ? "bg-green-400/10 text-green-400 ring-green-400/20" :
                              row.status === "label" ? "bg-blue-400/10 text-blue-400 ring-blue-400/20" :
                              "bg-yellow-400/10 text-yellow-400 ring-yellow-400/20"
                            }`}>
                              {row.status === "patented" ? t("publicProfile.statusPatented") : row.status === "label" ? t("publicProfile.statusLabel") : t("publicProfile.statusPending")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contribution graph placeholder */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{t("publicProfile.contributionsTitle")}</h3>
                      <div className="text-xs" style={{ color: TEXT_SECONDARY }}>{t("publicProfile.lastUpdated")}</div>
                    </div>
                    <div className="rounded-lg p-4 overflow-x-auto border border-[#233648]" style={{ backgroundColor: CARD_DARK }}>
                      <div className="min-w-[600px] flex flex-col gap-1">
                        <div className="flex gap-1 justify-between text-xs mb-2" style={{ color: TEXT_SECONDARY }}>
                          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => <span key={m}>{m}</span>)}
                        </div>
                        <div className="flex gap-0.5 h-[100px] w-full items-end justify-between">
                          {Array.from({ length: 52 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-0.5 justify-end flex-1 min-w-[8px]">
                              {[0,1,2,3,4,5,6].map((_, j) => (
                                <div key={j} className="w-full h-2 rounded-sm bg-[#233648]" style={{ opacity: 0.3 + Math.random() * 0.7 }} />
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 text-xs mt-3 justify-end" style={{ color: TEXT_SECONDARY }}>
                          <span>{t("publicProfile.less")}</span>
                          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#233648]" />
                          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#0e4429]" />
                          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#006d32]" />
                          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#26a641]" />
                          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#39d353]" />
                          <span>{t("publicProfile.more")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Latest Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">{t("publicProfile.latestActivity")}</h3>
                    <div className="flex flex-col gap-4 relative pl-4 border-l border-[#233648] ml-2">
                      {MOCK_ACTIVITY.map((item) => (
                        <div key={item.id} className="relative pl-6">
                          <div className="absolute -left-[21px] top-1 p-1 rounded-full border border-[#233648] bg-[#101922]" style={{ color: item.type === "verified" ? "rgb(34 197 94)" : TEXT_SECONDARY }}>
                            {item.type === "commit" && <GitCommit className="size-4 block" />}
                            {item.type === "verified" && <CheckCircle2 className="size-4 block text-green-500" />}
                            {item.type === "star" && <Star className="size-4 block" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs" style={{ color: TEXT_SECONDARY }}>{item.time}</span>
                            <p className="text-sm text-white">
                              {item.type === "commit" && (
                                <> {t("publicProfile.activityPushed")} <Link to="/explore" className="text-primary hover:underline font-medium">{item.linkText}</Link></>
                              )}
                              {item.type === "verified" && (
                                <> {t("publicProfile.activityLabel")} <span className="font-bold hover:underline">{item.linkText}</span> {t("publicProfile.activityLabelSuffix")}</>
                              )}
                              {item.type === "star" && (
                                <> {t("publicProfile.activityStarred")} <Link to="/explore" className="text-primary hover:underline font-medium">{item.linkText}</Link></>
                              )}
                            </p>
                            {item.detail && (
                              <div className="mt-1 text-xs font-mono p-1 rounded border border-[#233648] inline-block w-fit bg-[#16202a]" style={{ color: TEXT_SECONDARY }}>{item.detail}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="w-full py-2 mt-6 text-sm border border-[#233648] rounded-lg hover:bg-[#16202a] hover:text-white transition-colors" style={{ color: TEXT_SECONDARY }}>
                      {t("publicProfile.showMoreActivity")}
                    </button>
                  </div>
                </>
              )}

              {activeTab === "repositories" && (
                <div className="space-y-4">
                  {repos.length === 0 ? (
                    <p className="text-sm" style={{ color: TEXT_SECONDARY }}>{t("users.noRepos")}</p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {repos.map((repo) => (
                        <Link key={repo.id} to={`/repo/${repo.id}`} className="rounded-lg p-4 border border-[#233648] hover:border-[#92adc9]/50 transition-colors block" style={{ backgroundColor: CARD_DARK }}>
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="size-5 shrink-0 text-[#92adc9]" />
                            <span className="text-primary font-bold hover:underline truncate">{repo.name}</span>
                            <span className="border rounded-full px-2 py-0.5 text-xs" style={{ borderColor: CARD_BORDER, color: TEXT_SECONDARY }}>
                              {repo.visibility === "public" ? t("common.public") : t("common.private")}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2" style={{ color: TEXT_SECONDARY }}>{repo.description || "—"}</p>
                          <div className="flex items-center gap-4 text-xs mt-2" style={{ color: TEXT_SECONDARY }}>
                            {repo.languages?.[0] && (
                              <div className="flex items-center gap-1">
                                <span className={`w-3 h-3 rounded-full ${langColor(repo.languages[0])}`} />
                                <span>{repo.languages[0]}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "decision1275" && (
                <div className="rounded-lg overflow-hidden border border-[#233648]" style={{ backgroundColor: CARD_DARK }}>
                  <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-4 p-4 border-b border-[#233648] text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_SECONDARY }}>
                    <div>{t("publicProfile.project")}</div>
                    <div className="text-right hidden sm:block">{t("publicProfile.dateArchived")}</div>
                    <div className="text-right">{t("publicProfile.status")}</div>
                  </div>
                  {MOCK_PRESERVED.map((row) => (
                    <div key={row.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-4 p-4 border-b border-[#233648] hover:bg-[#101922]/50 items-center last:border-b-0">
                      <div className="flex gap-3">
                        <div className="mt-1">{row.status === "patented" ? <CheckCircle2 className="size-5 text-green-500" /> : <Archive className="size-5" style={{ color: TEXT_SECONDARY }} />}</div>
                        <div>
                          <h4 className="text-sm font-bold text-white hover:text-primary cursor-pointer">{row.title}</h4>
                          <p className="text-xs mt-0.5" style={{ color: TEXT_SECONDARY }}>{row.desc}</p>
                        </div>
                      </div>
                      <div className="text-sm text-right hidden sm:block" style={{ color: TEXT_SECONDARY }}>{row.date}</div>
                      <div className="text-right flex justify-end">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          row.status === "patented" ? "bg-green-400/10 text-green-400 ring-green-400/20" :
                          row.status === "label" ? "bg-blue-400/10 text-blue-400 ring-blue-400/20" :
                          "bg-yellow-400/10 text-yellow-400 ring-yellow-400/20"
                        }`}>
                          {row.status === "patented" ? t("publicProfile.statusPatented") : row.status === "label" ? t("publicProfile.statusLabel") : t("publicProfile.statusPending")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="flex flex-col gap-4 relative pl-4 border-l border-[#233648] ml-2">
                  {MOCK_ACTIVITY.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute -left-[21px] top-1 p-1 rounded-full border border-[#233648] bg-[#101922]" style={{ color: item.type === "verified" ? "rgb(34 197 94)" : TEXT_SECONDARY }}>
                        {item.type === "commit" && <GitCommit className="size-4 block" />}
                        {item.type === "verified" && <CheckCircle2 className="size-4 block text-green-500" />}
                        {item.type === "star" && <Star className="size-4 block" />}
                      </div>
                      <div>
                        <span className="text-xs" style={{ color: TEXT_SECONDARY }}>{item.time}</span>
                        <p className="text-sm text-white">
                          {item.type === "commit" && <> {t("publicProfile.activityPushed")} <Link to="/explore" className="text-primary hover:underline font-medium">{item.linkText}</Link></>}
                          {item.type === "verified" && <> {t("publicProfile.activityLabel")} <span className="font-bold">{item.linkText}</span> {t("publicProfile.activityLabelSuffix")}</>}
                          {item.type === "star" && <> {t("publicProfile.activityStarred")} <Link to="/explore" className="text-primary hover:underline font-medium">{item.linkText}</Link></>}
                        </p>
                        {item.detail && <div className="mt-1 text-xs font-mono p-1 rounded border border-[#233648] inline-block bg-[#16202a]" style={{ color: TEXT_SECONDARY }}>{item.detail}</div>}
                      </div>
                    </div>
                  ))}
                  <button type="button" className="w-full py-2 mt-4 text-sm border border-[#233648] rounded-lg hover:bg-[#16202a] hover:text-white transition-colors self-start" style={{ color: TEXT_SECONDARY }}>
                    {t("publicProfile.showMoreActivity")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
