import { useEffect, useState } from "react"
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRepo } from "@/hooks/useRepo"
import { listRepoFiles, getFileDownloadUrl, type RepoFileWithId } from "@/lib/files"
import { downloadRepoAsZip } from "@/lib/downloadRepoZip"
import { buildFileTree, type TreeNode } from "@/lib/fileTree"
import { getProfilesByIds } from "@/lib/users"
import { CodeBlock } from "@/components/CodeBlock"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { markdownComponents } from "@/components/MarkdownImage"
import {
  Code2,
  Bug,
  Archive,
  Users,
  Download,
  Star,
  ChevronDown,
  Search,
  Folder,
  Link2,
  Shield,
  Scale,
  Clock,
  Tag,
  BookOpen,
  GitBranch,
  Loader2,
} from "lucide-react"
import { getFileIcon } from "@/lib/fileIcons"

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp", "avif"])
const VIDEO_EXT = new Set(["mp4", "webm", "ogg", "mov", "avi", "mkv", "m4v"])
const AUDIO_EXT = new Set(["mp3", "wav", "ogg", "m4a", "aac", "flac", "weba", "opus"])
const PDF_EXT = new Set(["pdf"])
const MD_EXT = new Set(["md", "markdown"])

type PreviewKind = "image" | "video" | "audio" | "pdf"

function getPreviewKind(path: string): PreviewKind | null {
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1).toLowerCase() : ""
  if (IMAGE_EXT.has(ext)) return "image"
  if (VIDEO_EXT.has(ext)) return "video"
  if (AUDIO_EXT.has(ext)) return "audio"
  if (PDF_EXT.has(ext)) return "pdf"
  return null
}

function isMarkdownPath(path: string): boolean {
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1).toLowerCase() : ""
  return MD_EXT.has(ext)
}

/** Find node at path (path "" = root). Returns null if not found. */
function findNodeAtPath(root: TreeNode, path: string): TreeNode | null {
  if (!path) return root
  const parts = path.split("/").filter(Boolean)
  let current: TreeNode = root
  for (const part of parts) {
    const child = current.children.find((c) => c.name === part)
    if (!child) return null
    current = child
  }
  return current
}

/** Get direct children at path (folders first, then files, sorted by name). */
function getChildrenAtPath(root: TreeNode, path: string): TreeNode[] {
  const node = findNodeAtPath(root, path)
  const children = node?.children ?? []
  return [...children].sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1
    return a.name.localeCompare(b.name)
  })
}

function formatTimeAgo(timestamp: { toMillis?: () => number } | undefined): string {
  if (!timestamp?.toMillis) return "—"
  const ms = Date.now() - timestamp.toMillis()
  if (ms < 60 * 60 * 1000) return "1 hour ago"
  if (ms < 24 * 60 * 60 * 1000) return "2 hours ago"
  if (ms < 7 * 24 * 60 * 60 * 1000) return "3 days ago"
  if (ms < 14 * 24 * 60 * 60 * 1000) return "1 week ago"
  return "2 weeks ago"
}

type TabId = "code" | "issues" | "archives" | "contributors"

export function RepoDetailPage() {
  const { t } = useTranslation()
  const { repoId } = useParams<{ repoId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { repo, loading, error } = useRepo(repoId)
  const [files, setFiles] = useState<RepoFileWithId[]>([])
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [filePreviewKind, setFilePreviewKind] = useState<PreviewKind | null>(null)
  const [fileContentLoading, setFileContentLoading] = useState(false)
  const [fileContentError, setFileContentError] = useState<string | null>(null)
  const [ownerName, setOwnerName] = useState<string>("—")
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>("code")
  const [zipDownloading, setZipDownloading] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)

  const selectedPath = searchParams.get("file")

  /** Sync currentPath when selected file is from URL so breadcrumb shows correct folder */
  useEffect(() => {
    if (selectedPath && selectedPath.includes("/")) {
      const dir = selectedPath.slice(0, selectedPath.lastIndexOf("/"))
      setCurrentPath(dir)
    } else if (selectedPath && !selectedPath.includes("/")) {
      setCurrentPath("")
    }
  }, [selectedPath])

  const setSelectedFile = (path: string | null) => {
    if (path) setSearchParams({ file: path }, { replace: true })
    else {
      searchParams.delete("file")
      setSearchParams(searchParams, { replace: true })
    }
  }

  useEffect(() => {
    if (!repoId) return
    listRepoFiles(repoId)
      .then((list) => {
        setFiles(list)
        const paths = list.map((f) => f.path)
        setTree(buildFileTree(paths))
      })
      .catch(() => setFiles([]))
  }, [repoId])

  useEffect(() => {
    if (!repo?.ownerId) return
    getProfilesByIds([repo.ownerId]).then((map) => {
      const p = map.get(repo.ownerId)
      setOwnerName(p?.displayName || p?.username || "—")
      setOwnerUsername(p?.username ?? null)
    })
  }, [repo?.ownerId])

  useEffect(() => {
    if (!repoId || !selectedPath) {
      setFileContent(null)
      setFilePreviewUrl(null)
      setFilePreviewKind(null)
      setFileContentError(null)
      return
    }
    const file = files.find((f) => f.path === selectedPath)
    if (!file) {
      setFileContentError(t("repo.fileNotFound"))
      setFileContent(null)
      setFilePreviewUrl(null)
      setFilePreviewKind(null)
      return
    }
    setFileContentLoading(true)
    setFileContentError(null)
    const previewKind = getPreviewKind(selectedPath)
    if (previewKind) {
      getFileDownloadUrl(file.storagePath)
        .then((url) => {
          setFilePreviewUrl(url)
          setFilePreviewKind(previewKind)
          setFileContent(null)
        })
        .catch(() => {
          setFileContentError(t("repo.failedLoadContent"))
          setFilePreviewUrl(null)
          setFilePreviewKind(null)
        })
        .finally(() => setFileContentLoading(false))
    } else {
      setFilePreviewUrl(null)
      setFilePreviewKind(null)
      getFileDownloadUrl(file.storagePath)
        .then((url) => fetch(url))
        .then((r) => r.text())
        .then((text) => setFileContent(text))
        .catch(() => {
          setFileContentError(t("repo.failedLoadContent"))
          setFileContent(null)
        })
        .finally(() => setFileContentLoading(false))
    }
  }, [repoId, selectedPath, files, t])

  useEffect(() => {
    if (repo && repo.visibility === "private" && user?.uid !== repo.ownerId) {
      navigate("/login")
    }
  }, [repo, user?.uid, navigate])

  if (loading || !repoId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background dark:bg-surface-page">
        <p className="text-subtle-fg">{t("repo.loading")}</p>
      </div>
    )
  }
  if (error || !repo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background dark:bg-surface-page">
        <p className="text-destructive">{t("repo.notFound")}</p>
        <Button variant="link" asChild>
          <Link to="/">{t("common.backToHome")}</Link>
        </Button>
      </div>
    )
  }

  const isOwner = user?.uid === repo.ownerId

  async function handleDownloadCodebase() {
    if (!repo || files.length === 0) return
    setZipError(null)
    setZipDownloading(true)
    try {
      await downloadRepoAsZip(repo.name, repo.id, files)
    } catch {
      setZipError(t("repoDetail.downloadZipFailed"))
    } finally {
      setZipDownloading(false)
    }
  }

  const currentDirChildren = tree ? getChildrenAtPath(tree, currentPath) : []
  const breadcrumbSegments = currentPath ? [repo.name, ...currentPath.split("/")] : [repo.name]

  const getFileTime = (path: string): string => {
    const f = files.find((x) => x.path === path)
    return f?.uploadedAt ? formatTimeAgo(f.uploadedAt as { toMillis: () => number }) : "—"
  }

  const languages = repo.languages ?? []
  const langPercent = languages.length > 0 ? 100 / languages.length : 0

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-surface-page text-slate-900 dark:text-white">
      <main className="flex-1 flex justify-center py-6 px-4 md:px-10 lg:px-40">
        <div className="flex flex-col max-w-[1200px] w-full gap-6">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link to="/" className="hover:text-primary transition-colors" style={{ color: "var(--subtle-fg)" }}>
              {t("repoDetail.home")}
            </Link>
            <span style={{ color: "var(--subtle-fg)" }}>/</span>
            <Link to="/explore" className="hover:text-primary transition-colors" style={{ color: "var(--subtle-fg)" }}>
              {t("repoDetail.repositories")}
            </Link>
            <span style={{ color: "var(--subtle-fg)" }}>/</span>
            <span className="font-medium text-slate-900 dark:text-white">{repo.name}</span>
          </nav>

          {/* Project Header */}
          <div className="@container">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:justify-between lg:items-start">
              <div className="flex gap-5">
                <div className="h-24 w-24 shrink-0 rounded-xl bg-gradient-to-br from-blue-900 to-slate-900 border flex items-center justify-center shadow-lg" style={{ borderColor: "var(--border-strong)" }}>
                  <Code2 className="size-10 text-blue-400" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                      {repo.name}
                    </h1>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider shrink-0 ${repo.visibility === "public" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"}`}>
                      {repo.visibility === "public" ? t("common.public") : t("common.private")}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="text-base max-w-2xl leading-relaxed mt-1" style={{ color: "var(--subtle-fg)" }}>
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm flex-wrap" style={{ color: "var(--subtle-fg)" }}>
                    <span className="flex items-center gap-1">
                      <Clock className="size-[18px]" />
                      {t("repoDetail.updatedAgo")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="size-[18px]" />
                      {t("repoDetail.version")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Scale className="size-[18px]" />
                      {t("repoDetail.license")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row min-w-[280px] shrink-0">
                {(repo.visibility === "public" || isOwner) && (
                  <Button asChild className="flex-1 h-10 px-5 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-sm">
                    <Link to={`/repo/${repoId}/certificate`}>
                      <Download className="size-5 mr-2" />
                      {t("repoDetail.downloadCertificate")}
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="flex-1 h-10 px-5 rounded-lg border dark:bg-surface-muted dark:border-border-strong dark:hover:bg-border-strong/30">
                  <Star className="size-5 mr-2" />
                  {t("repoDetail.star")}
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-300 dark:bg-black/30 text-xs">0</span>
                </Button>
                {isOwner && (
                  <Button asChild variant="outline" className="flex-1 h-10 px-5 rounded-lg border dark:bg-surface-muted dark:border-border-strong">
                    <Link to={`/repo/${repoId}/upload`}>{t("repo.uploadFiles")}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-2 border-b border-border-strong">
            <div className="flex gap-8 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`group flex items-center gap-2 border-b-[3px] pb-3 px-1 shrink-0 font-bold text-sm transition-colors ${activeTab === "code" ? "border-primary text-slate-900 dark:text-white" : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"}`}
                style={activeTab !== "code" ? { color: "var(--subtle-fg)" } : undefined}
              >
                <Code2 className="size-5" style={activeTab === "code" ? { color: "var(--primary)" } : undefined} />
                {t("repoDetail.tabCode")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("issues")}
                className={`group flex items-center gap-2 border-b-[3px] pb-3 px-1 shrink-0 font-bold text-sm transition-colors ${activeTab === "issues" ? "border-primary text-slate-900 dark:text-white" : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"}`}
                style={activeTab !== "issues" ? { color: "var(--subtle-fg)" } : undefined}
              >
                <Bug className="size-5" />
                {t("repoDetail.tabIssues")}
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-normal bg-slate-200 dark:bg-surface-muted" style={{ color: "var(--subtle-fg)" }}>0</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("archives")}
                className={`group flex items-center gap-2 border-b-[3px] pb-3 px-1 shrink-0 font-bold text-sm transition-colors ${activeTab === "archives" ? "border-primary text-slate-900 dark:text-white" : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"}`}
                style={activeTab !== "archives" ? { color: "var(--subtle-fg)" } : undefined}
              >
                <Archive className="size-5" />
                {t("repoDetail.tabArchives")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contributors")}
                className={`group flex items-center gap-2 border-b-[3px] pb-3 px-1 shrink-0 font-bold text-sm transition-colors ${activeTab === "contributors" ? "border-primary text-slate-900 dark:text-white" : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"}`}
                style={activeTab !== "contributors" ? { color: "var(--subtle-fg)" } : undefined}
              >
                <Users className="size-5" />
                {t("repoDetail.tabContributors")}
              </button>
            </div>
          </div>

          {activeTab === "code" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-6 min-w-0">
                {/* Actions Bar */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium bg-slate-200 dark:bg-surface-muted border-slate-300 dark:border-border-strong text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-border-strong/30 transition-colors">
                      <GitBranch className="size-[18px]" aria-hidden />
                      master
                      <ChevronDown className="size-4" />
                    </button>
                    <div className="mx-1 h-4 w-px bg-slate-300 dark:bg-border-strong" />
                    <nav className="text-sm truncate flex items-center gap-1 min-w-0 flex-wrap" style={{ color: "var(--subtle-fg)" }} aria-label="Breadcrumb">
                      {breadcrumbSegments.map((segment, i) => {
                        const pathUpToHere = i === 0 ? "" : breadcrumbSegments.slice(1, i + 1).join("/")
                        const isLast = i === breadcrumbSegments.length - 1
                        return (
                          <span key={pathUpToHere || "root"} className="flex items-center gap-1 shrink-0">
                            {i > 0 && <span className="opacity-70">/</span>}
                            {isLast ? (
                              <span className="text-slate-700 dark:text-slate-200 font-medium">{segment}</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCurrentPath(pathUpToHere)}
                                className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none"
                              >
                                {segment}
                              </button>
                            )}
                          </span>
                        )
                      })}
                    </nav>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button type="button" className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-surface-muted/80 transition-colors" style={{ color: "var(--subtle-fg)" }} title={t("repoDetail.search")} aria-label={t("repoDetail.search")}>
                      <Search className="size-5" />
                    </button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-md border-slate-300 dark:border-border-strong text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-muted/80 text-sm font-medium"
                      disabled={zipDownloading || files.length === 0}
                      onClick={() => void handleDownloadCodebase()}
                    >
                      {zipDownloading ? (
                        <Loader2 className="mr-1.5 size-4 shrink-0 animate-spin" aria-hidden />
                      ) : (
                        <Download className="mr-1.5 size-4 shrink-0" aria-hidden />
                      )}
                      {zipDownloading ? t("repoDetail.downloadZipWorking") : t("repoDetail.downloadCodebase")}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-md border-slate-300 dark:border-border-strong text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-muted/80 text-sm font-medium" asChild>
                      <Link to={selectedPath ? `/repo/${repoId}/code/${encodeURIComponent(selectedPath)}` : `/repo/${repoId}/code`}>
                        {t("repoDetail.openInCodeEditor")}
                      </Link>
                    </Button>
                    <Button size="sm" className="rounded-md bg-primary text-white text-sm font-medium hover:bg-blue-600 shadow-sm">
                      {t("repoDetail.goToFile")}
                    </Button>
                  </div>
                </div>
                {zipError && (
                  <p className="text-sm text-destructive" role="alert">
                    {zipError}
                  </p>
                )}

                {/* File Explorer */}
                <div className="rounded-lg overflow-hidden border bg-white dark:bg-surface" style={{ borderColor: "var(--border-strong)" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 dark:bg-surface-muted" style={{ borderColor: "var(--border-strong)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {(ownerName || "?")[0].toUpperCase()}
                      </div>
                      {ownerUsername ? (
                        <Link to={`/${ownerUsername}`} className="text-sm font-medium text-slate-900 dark:text-white truncate hover:text-primary hover:underline transition-colors">
                          {ownerName}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{ownerName}</span>
                      )}
                      <span className="text-sm truncate max-w-[200px] sm:max-w-none" style={{ color: "var(--subtle-fg)" }}>
                        {t("repoDetail.latestCommit")}
                      </span>
                    </div>
                    <span className="text-xs whitespace-nowrap shrink-0" style={{ color: "var(--subtle-fg)" }}>{t("repoDetail.updatedAgo")}</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-border-strong/50">
                    {currentDirChildren.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--subtle-fg)" }}>
                        {currentPath ? t("repoDetail.folderEmpty") : t("repo.noFiles")}
                      </div>
                    ) : (
                      currentDirChildren.map((node) => {
                        const isSelected = selectedPath === node.path
                        const Icon = node.isFile ? getFileIcon(node.name) : Folder
                        return (
                          <button
                            key={node.path}
                            type="button"
                            onClick={() => {
                              if (node.isFile) {
                                setSelectedFile(node.path)
                              } else {
                                setCurrentPath(node.path)
                              }
                            }}
                            className={`group flex items-center justify-between px-4 py-2.5 w-full text-left transition-colors cursor-pointer ${isSelected ? "bg-primary/10" : "hover:bg-slate-50 dark:hover:bg-surface-muted/80/50"}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`size-5 shrink-0 ${node.isFile ? "text-slate-400" : "text-blue-400"}`} />
                              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{node.name}</span>
                            </div>
                            <span className="text-xs hidden sm:block truncate max-w-[120px]" style={{ color: "var(--subtle-fg)" }}>—</span>
                            <span className="text-xs w-24 text-right shrink-0" style={{ color: "var(--subtle-fg)" }}>{node.isFile ? getFileTime(node.path) : "—"}</span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* README or File Content */}
                <div className="rounded-lg border overflow-hidden bg-white dark:bg-surface" style={{ borderColor: "var(--border-strong)" }}>
                  <div className="px-4 py-3 border-b bg-slate-50 dark:bg-surface-muted flex items-center gap-2 sticky top-0" style={{ borderColor: "var(--border-strong)" }}>
                    <BookOpen className="size-5 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {selectedPath ?? "README.md"}
                    </h3>
                    {selectedPath && (
                      <Button variant="ghost" size="sm" className="ml-auto shrink-0" onClick={() => setSelectedFile(null)}>
                        {t("repo.viewReadme")}
                      </Button>
                    )}
                  </div>
                  <div className="p-6 min-h-[200px] min-w-0 overflow-x-auto">
                    {selectedPath ? (
                      <>
                        {fileContentError && <p className="mb-3 text-sm text-destructive">{fileContentError}</p>}
                        {fileContentLoading && (
                          <div className="flex items-center justify-center py-12">
                            <p className="text-sm" style={{ color: "var(--subtle-fg)" }}>{t("common.loading")}</p>
                          </div>
                        )}
                        {!fileContentLoading && filePreviewUrl && filePreviewKind && (
                          <div className="rounded-lg border p-4 overflow-auto" style={{ borderColor: "var(--border-strong)" }}>
                            {filePreviewKind === "image" && <img src={filePreviewUrl} alt={selectedPath} className="max-w-full rounded object-contain max-h-[70vh]" />}
                            {filePreviewKind === "video" && <video src={filePreviewUrl} controls className="max-w-full rounded max-h-[70vh]" preload="metadata" />}
                            {filePreviewKind === "audio" && <audio src={filePreviewUrl} controls className="w-full max-w-md" preload="metadata" />}
                            {filePreviewKind === "pdf" && <iframe src={filePreviewUrl} title={selectedPath} className="w-full h-[70vh] min-h-[400px] rounded border-0" />}
                          </div>
                        )}
                        {!fileContentLoading && fileContent != null && !filePreviewUrl && (
                          isMarkdownPath(selectedPath) ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none w-full min-w-0 prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-slate-900 dark:prose-pre:bg-black prose-pre:border prose-pre:border-border-strong prose-pre:text-green-400 prose-a:text-primary prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto [&_img]:max-w-full [&_img]:h-auto">
                              <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>{fileContent}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className="rounded-md overflow-hidden border border-slate-800 dark:border-border-strong">
                              <CodeBlock code={fileContent} filePath={selectedPath} />
                            </div>
                          )
                        )}
                        {!fileContentLoading && fileContent == null && !filePreviewUrl && !fileContentError && (
                          <p className="text-sm" style={{ color: "var(--subtle-fg)" }}>{t("repo.selectFile")}</p>
                        )}
                      </>
                    ) : (
                      repo.readme ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none w-full min-w-0 prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-slate-900 dark:prose-pre:bg-black prose-pre:border prose-pre:border-border-strong prose-pre:text-green-400 prose-img:max-w-full prose-img:h-auto [&_img]:max-w-full [&_img]:h-auto">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>{repo.readme}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--subtle-fg)" }}>
                          {files.length === 0 && isOwner ? t("repo.emptyHint") : t("repo.selectFile")}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("repoDetail.about")}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {repo.description || t("repoDetail.aboutPlaceholder")}
                  </p>
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Link2 className="size-[18px] shrink-0" />
                      <Link to={`/repo/${repoId}`} className="text-primary hover:underline truncate">
                        {repo.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Shield className="size-[18px]" />
                      <span>{t("repoDetail.securityPolicy")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Scale className="size-[18px]" />
                      <span>{t("repoDetail.decision1275")}</span>
                    </div>
                  </div>
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-border-strong" />
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("repoDetail.languages")}</h3>
                  {languages.length > 0 ? (
                    <>
                      <div className="w-full h-2.5 rounded-full flex overflow-hidden bg-slate-200 dark:bg-surface-muted">
                        {languages.slice(0, 5).map((_, i) => (
                          <div
                            key={i}
                            className="h-full"
                            style={{
                              width: `${langPercent}%`,
                              backgroundColor: i === 0 ? "#eab308" : i === 1 ? "#3b82f6" : i === 2 ? "#a855f7" : i === 3 ? "#22c55e" : "#64748b",
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {languages.map((lang, i) => (
                          <div key={lang} className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: i === 0 ? "#eab308" : i === 1 ? "#3b82f6" : i === 2 ? "#a855f7" : "#64748b" }}
                            />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {lang} <span className="text-slate-400">{languages.length > 0 ? Math.round(100 / languages.length) : 0}%</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--subtle-fg)" }}>{t("repoDetail.noLanguages")}</p>
                  )}
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-border-strong" />
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("repoDetail.contributors")} <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-normal bg-slate-200 dark:bg-surface-muted" style={{ color: "var(--subtle-fg)" }}>1</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ownerUsername ? (
                    <Link to={`/${ownerUsername}`} className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all bg-gradient-to-tr from-blue-400 to-cyan-300 block" title={ownerName} />
                  ) : (
                    <span className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent bg-gradient-to-tr from-blue-400 to-cyan-300 block" title={ownerName} />
                  )}
                    <span className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 dark:bg-surface-muted border border-dashed border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary transition-colors cursor-pointer">
                      +0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "issues" && (
            <div className="rounded-lg border p-8 text-center bg-white dark:bg-surface" style={{ borderColor: "var(--border-strong)" }}>
              <Bug className="size-12 mx-auto mb-3 opacity-50" style={{ color: "var(--subtle-fg)" }} />
              <p className="text-sm" style={{ color: "var(--subtle-fg)" }}>{t("repoDetail.issuesPlaceholder")}</p>
            </div>
          )}

          {activeTab === "archives" && (
            <div className="rounded-lg border p-8 text-center bg-white dark:bg-surface" style={{ borderColor: "var(--border-strong)" }}>
              <Archive className="size-12 mx-auto mb-3 opacity-50" style={{ color: "var(--subtle-fg)" }} />
              <p className="text-sm" style={{ color: "var(--subtle-fg)" }}>{t("repoDetail.archivesPlaceholder")}</p>
            </div>
          )}

          {activeTab === "contributors" && (
            <div className="rounded-lg border p-8 text-center bg-white dark:bg-surface" style={{ borderColor: "var(--border-strong)" }}>
              <Users className="size-12 mx-auto mb-3 opacity-50" style={{ color: "var(--subtle-fg)" }} />
              <p className="text-sm" style={{ color: "var(--subtle-fg)" }}>{t("repoDetail.contributorsPlaceholder")}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
