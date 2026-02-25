import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/contexts/AuthContext"
import { useRepo } from "@/hooks/useRepo"
import { listRepoFiles, getFileDownloadUrl, type RepoFileWithId } from "@/lib/files"
import { buildFileTree, getChildrenAtPath, type TreeNode } from "@/lib/fileTree"
import { getFileIcon } from "@/lib/fileIcons"
import { getLanguageLabel } from "@/lib/codeLanguage"
import { SourceCodeViewer } from "@/components/SourceCodeViewer"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { markdownComponents } from "@/components/MarkdownImage"
import {
  ArrowLeft,
  Lock,
  Search,
  Folder,
  FolderOpen,
  MoreHorizontal,
  History,
  Download,
  Calendar,
  Bug,
  ShieldCheck,
} from "lucide-react"

const BORDER_DARK = "#233648"
const SURFACE_DARK = "#16202a"
const BG_DARK = "#101922"
const TEXT_MUTED = "#92adc9"
const CODE_BG = "#0d1117"

const MD_EXT = new Set(["md", "markdown"])
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp", "avif"])
const VIDEO_EXT = new Set(["mp4", "webm", "ogg", "mov", "avi", "mkv"])
const AUDIO_EXT = new Set(["mp3", "wav", "ogg", "m4a", "aac"])
const PDF_EXT = new Set(["pdf"])

function isMarkdownPath(path: string): boolean {
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1).toLowerCase() : ""
  return MD_EXT.has(ext)
}

function getPreviewKind(path: string): "image" | "video" | "audio" | "pdf" | null {
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1).toLowerCase() : ""
  if (IMAGE_EXT.has(ext)) return "image"
  if (VIDEO_EXT.has(ext)) return "video"
  if (AUDIO_EXT.has(ext)) return "audio"
  if (PDF_EXT.has(ext)) return "pdf"
  return null
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function CodeEditorPage() {
  const { t } = useTranslation()
  const params = useParams()
  const repoId = params.repoId ?? ""
  const splat = params["*"] ?? ""
  const selectedPathFromUrl = splat ? decodeURIComponent(splat).replace(/^\//, "") : null
  const navigate = useNavigate()
  const { user } = useAuth()
  const { repo, loading: repoLoading } = useRepo(repoId)

  const [files, setFiles] = useState<RepoFileWithId[]>([])
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([""]))
  const [selectedPath, setSelectedPath] = useState<string | null>(selectedPathFromUrl)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileDownloadUrl, setFileDownloadUrl] = useState<string | null>(null)
  const [fileContentLoading, setFileContentLoading] = useState(false)
  const [fileContentError, setFileContentError] = useState<string | null>(null)
  const [treeSearch, setTreeSearch] = useState("")

  // Sync selected path from URL (e.g. back/forward)
  useEffect(() => {
    setSelectedPath(selectedPathFromUrl)
  }, [selectedPathFromUrl])

  // Expand all parent folders of the selected file so it's visible in the tree
  useEffect(() => {
    if (!selectedPathFromUrl || !selectedPathFromUrl.includes("/")) return
    const parts = selectedPathFromUrl.split("/")
    const folderPaths = parts.slice(0, -1).reduce<string[]>((acc, _, i) => {
      acc.push(parts.slice(0, i + 1).join("/"))
      return acc
    }, [])
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      folderPaths.forEach((p) => next.add(p))
      return next
    })
  }, [selectedPathFromUrl])

  // Load repo files
  useEffect(() => {
    if (!repoId) return
    listRepoFiles(repoId)
      .then((list) => {
        setFiles(list)
        setTree(buildFileTree(list.map((f) => f.path)))
      })
      .catch(() => setFiles([]))
  }, [repoId])

  // Load selected file content
  const loadFileContent = useCallback(
    (path: string) => {
      if (!repoId || !path) return
      const file = files.find((f) => f.path === path)
      if (!file) {
        setFileContentError(t("fileViewer.fileNotFound"))
        setFileContent(null)
        setFileDownloadUrl(null)
        return
      }
      setFileContentLoading(true)
      setFileContentError(null)
      const previewKind = getPreviewKind(path)
      getFileDownloadUrl(file.storagePath)
        .then((url) => {
          setFileDownloadUrl(url)
          if (previewKind) {
            setFileContent(null)
            setFileContentLoading(false)
            return
          }
          return fetch(url).then((r) => r.text())
        })
        .then((text) => {
          if (typeof text === "string") setFileContent(text)
          setFileContentLoading(false)
        })
        .catch(() => {
          setFileContentError(t("fileViewer.failedLoad"))
          setFileContent(null)
          setFileContentLoading(false)
        })
    },
    [repoId, files, t]
  )

  useEffect(() => {
    if (!selectedPath) {
      setFileContent(null)
      setFileDownloadUrl(null)
      setFileContentError(null)
      return
    }
    loadFileContent(selectedPath)
  }, [selectedPath, loadFileContent])

  const navigateToFile = (path: string) => {
    navigate(`/repo/${repoId}/code/${encodeURIComponent(path)}`, { replace: true })
    setSelectedPath(path)
  }

  const toggleFolder = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  if (repoLoading || !repoId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101922]">
        <p className="text-[#92adc9]">{t("common.loading")}</p>
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101922]">
        <p className="text-destructive">{t("fileViewer.fileNotFound")}</p>
        <Link to={`/repo/${repoId}`} className="text-primary mt-2">
          {t("fileViewer.backToRepo")}
        </Link>
      </div>
    )
  }

  if (repo.visibility === "private" && user?.uid !== repo.ownerId) {
    navigate("/login")
    return null
  }

  const rootChildren = tree ? getChildrenAtPath(tree, "") : []
  const lineCount = fileContent ? fileContent.split(/\n/).length : 0
  const sizeBytes = fileContent ? new TextEncoder().encode(fileContent).length : 0
  const sizeStr = formatBytes(sizeBytes)
  const langLabel = selectedPath ? getLanguageLabel(selectedPath) : "—"
  const previewKind = selectedPath ? getPreviewKind(selectedPath) : null

  function renderTreeNodes(nodes: TreeNode[], parentPath: string, depth: number): React.ReactNode {
    const sorted = [...nodes].sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1
      return a.name.localeCompare(b.name)
    })
    return sorted
      .filter((n) => !treeSearch || n.name.toLowerCase().includes(treeSearch.toLowerCase()))
      .map((node) => {
        const isExpanded = expandedPaths.has(node.path)
        const isSelected = selectedPath === node.path
        if (node.isFile) {
          const Icon = getFileIcon(node.name)
          return (
            <button
              key={node.path}
              type="button"
              onClick={() => navigateToFile(node.path)}
              className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer border-r-2 ${
                isSelected
                  ? "bg-primary/10 text-white font-medium border-primary"
                  : "border-transparent text-[#92adc9] hover:bg-white/5 hover:text-white"
              }`}
              style={{ paddingLeft: `${12 + depth * 16}px` }}
            >
              <Icon className="size-[18px] shrink-0 text-blue-400" />
              <span className="truncate">{node.name}</span>
            </button>
          )
        }
        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleFolder(node.path)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-sm text-[#92adc9] hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              style={{ paddingLeft: `${12 + depth * 16}px` }}
            >
              {isExpanded ? (
                <FolderOpen className="size-[18px] shrink-0 text-[#92adc9]" />
              ) : (
                <Folder className="size-[18px] shrink-0 text-yellow-500/80" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {isExpanded && (
              <div className="border-l border-[#233648] ml-6 my-1">
                {renderTreeNodes(node.children, node.path, depth + 1)}
              </div>
            )}
          </div>
        )
      })
  }

  return (
    <div className="h-screen flex flex-col bg-[#101922] text-slate-100 overflow-hidden">
      {/* Header - match reference */}
      <header
        className="flex items-center justify-between border-b px-6 py-3 h-16 shrink-0 z-20"
        style={{ borderColor: BORDER_DARK, backgroundColor: BG_DARK }}
      >
        <div className="flex items-center gap-8 min-w-0">
          <Link to={`/repo/${repoId}`} className="flex items-center gap-3 text-white shrink-0">
            <div className="size-8 flex items-center justify-center bg-primary rounded-lg">
              <Lock className="size-5 text-white" />
            </div>
            <h2 className="text-lg font-bold tracking-tight truncate">{repo.name}</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-2 text-sm min-w-0" aria-label="Breadcrumb">
            <Link to={`/repo/${repoId}`} className="truncate font-medium text-white hover:underline">
              {repo.name}
            </Link>
            {selectedPath && (
              <>
                <span style={{ color: TEXT_MUTED }}>/</span>
                <span
                  className="font-medium text-white truncate max-w-[240px] flex items-center gap-2 px-2 py-1 rounded border bg-[#16202a]"
                  style={{ borderColor: BORDER_DARK }}
                >
                  <Lock className="size-4 text-primary shrink-0" />
                  {selectedPath.split("/").pop()}
                </span>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5" style={{ color: TEXT_MUTED }} />
            <input
              type="text"
              placeholder={t("codeEditor.searchFiles")}
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              className="bg-[#16202a] border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-64 placeholder:opacity-50"
              style={{ borderColor: BORDER_DARK }}
            />
          </div>
          <div className="h-8 w-px bg-[#233648]" />
          <Link
            to={`/repo/${repoId}`}
            className="flex items-center gap-2 text-sm text-[#92adc9] hover:text-white transition-colors"
          >
            <ArrowLeft className="size-5" />
            {t("fileViewer.repository")}
          </Link>
        </div>
      </header>

      {/* Main: sidebar + code + right panel */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Explorer */}
        <aside
          className="w-64 flex flex-col shrink-0 border-r overflow-hidden"
          style={{ backgroundColor: SURFACE_DARK, borderColor: BORDER_DARK }}
        >
          <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: BORDER_DARK }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
              {t("codeEditor.explorer")}
            </span>
            <button type="button" className="p-1 rounded hover:bg-white/5" style={{ color: TEXT_MUTED }} aria-label={t("codeEditor.moreOptions")}>
              <MoreHorizontal className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <div className="flex flex-col text-sm">
              {rootChildren.length === 0 ? (
                <p className="px-4 py-2 text-sm" style={{ color: TEXT_MUTED }}>
                  {t("repo.noFiles")}
                </p>
              ) : (
                renderTreeNodes(rootChildren, "", 0)
              )}
            </div>
          </div>
          <div className="p-4 border-t" style={{ borderColor: BORDER_DARK }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: TEXT_MUTED }}>
              <div className="size-2 rounded-full bg-green-500" />
              {t("codeEditor.verifiedRepo")}
            </div>
          </div>
        </aside>

        {/* Center: Code viewer */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#101922]">
          {selectedPath ? (
            <>
              {/* Toolbar */}
              <div
                className="flex items-center justify-between px-6 py-3 border-b shrink-0 sticky top-0 z-10 backdrop-blur-sm"
                style={{ borderColor: BORDER_DARK, backgroundColor: "rgba(22, 32, 42, 0.7)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-sm gap-2" style={{ color: TEXT_MUTED }}>
                    <History className="size-5" />
                    <span>{fileContentLoading ? "—" : `${lineCount} lines`}</span>
                    <span className="opacity-70">•</span>
                    <span>{fileContentLoading ? "—" : sizeStr}</span>
                    <span className="opacity-70">•</span>
                    <span className="font-medium text-slate-200">{langLabel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex rounded-lg border p-0.5 bg-[#16202a]"
                    style={{ borderColor: BORDER_DARK }}
                  >
                    <span className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/20 text-primary">
                      Code
                    </span>
                    {fileDownloadUrl && (
                      <a
                        href={fileDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors hover:text-white"
                        style={{ color: TEXT_MUTED }}
                      >
                        Raw
                      </a>
                    )}
                  </div>
                  {fileDownloadUrl && (
                    <a
                      href={fileDownloadUrl}
                      download
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Download className="size-4" />
                      {t("fileViewer.download")}
                    </a>
                  )}
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-auto min-h-0">
                {fileContentError && (
                  <p className="p-4 text-sm text-destructive">{fileContentError}</p>
                )}
                {fileContentLoading && (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm" style={{ color: TEXT_MUTED }}>{t("common.loading")}</p>
                  </div>
                )}
                {!fileContentLoading && previewKind && fileDownloadUrl && (
                  <div className="p-4">
                    {previewKind === "image" && (
                      <img src={fileDownloadUrl} alt={selectedPath} className="max-w-full rounded max-h-[70vh] object-contain" />
                    )}
                    {previewKind === "video" && (
                      <video src={fileDownloadUrl} controls className="max-w-full rounded max-h-[70vh]" />
                    )}
                    {previewKind === "audio" && (
                      <audio src={fileDownloadUrl} controls className="w-full max-w-md" />
                    )}
                    {previewKind === "pdf" && (
                      <iframe src={fileDownloadUrl} title={selectedPath} className="w-full h-[70vh] min-h-[400px] rounded border-0" />
                    )}
                  </div>
                )}
                {!fileContentLoading && fileContent != null && !previewKind && (
                  isMarkdownPath(selectedPath) ? (
                    <div className="p-6 prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-pre:bg-[#0d1117] prose-img:max-w-full [&_img]:max-w-full">
                      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                        {fileContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full min-h-[400px] p-0">
                      <SourceCodeViewer
                        code={fileContent}
                        filePath={selectedPath}
                        rawUrl={fileDownloadUrl}
                        downloadUrl={fileDownloadUrl}
                        showToolbar={false}
                        showStats={false}
                        className="h-full rounded-none border-0"
                      />
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ color: TEXT_MUTED }}>
              <p className="text-sm">{t("codeEditor.selectFile")}</p>
            </div>
          )}
        </main>

        {/* Right: File Details */}
        <aside
          className="w-72 flex flex-col shrink-0 overflow-y-auto border-l"
          style={{ backgroundColor: SURFACE_DARK, borderColor: BORDER_DARK }}
        >
          <div className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{t("codeEditor.fileDetails")}</h3>
            <div className="space-y-6">
              {/* Last commit placeholder */}
              <div className="rounded-lg p-3 border bg-[#101922]" style={{ borderColor: BORDER_DARK }}>
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border" style={{ borderColor: BORDER_DARK }}>
                    <History className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{t("repoDetail.latestCommit")}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: TEXT_MUTED }}>—</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ color: TEXT_MUTED }}>
                  <Calendar className="size-3.5" />
                  —
                  <span className="mx-1">•</span>
                  <span className="font-mono text-primary bg-primary/10 px-1 rounded">—</span>
                </div>
              </div>

              {/* Properties */}
              <div>
                <h4 className="text-xs font-medium uppercase mb-3 tracking-wide" style={{ color: TEXT_MUTED }}>
                  {t("codeEditor.properties")}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: TEXT_MUTED }}>{t("codeEditor.size")}</span>
                    <span className="text-white font-mono">{selectedPath ? sizeStr : "—"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: TEXT_MUTED }}>{t("codeEditor.lines")}</span>
                    <span className="text-white font-mono">{selectedPath ? (fileContentLoading ? "—" : lineCount) : "—"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: TEXT_MUTED }}>{t("codeEditor.language")}</span>
                    <div className="flex items-center gap-1.5 text-white">
                      <div className="size-2 rounded-full bg-blue-500" />
                      {langLabel}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: TEXT_MUTED }}>{t("codeEditor.encoding")}</span>
                    <span className="text-white">UTF-8</span>
                  </div>
                </div>
              </div>

              <div className="h-px w-full" style={{ backgroundColor: BORDER_DARK }} />

              {/* Security badge - match reference */}
              <div className="bg-blue-500/10 border rounded-lg p-3" style={{ borderColor: "rgba(59, 130, 246, 0.2)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="size-[18px] text-primary" />
                  <span className="text-xs font-bold text-primary">{t("codeEditor.securityPassed")}</span>
                </div>
                <p className="text-[10px] leading-snug" style={{ color: TEXT_MUTED }}>
                  {t("codeEditor.securityDescription")}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto p-4 border-t" style={{ borderColor: BORDER_DARK }}>
            <button
              type="button"
              className="w-full py-2 px-4 rounded-lg text-sm border flex items-center justify-center gap-2 transition-colors hover:text-white"
              style={{ backgroundColor: SURFACE_DARK, borderColor: BORDER_DARK, color: TEXT_MUTED }}
            >
              <Bug className="size-[18px]" />
              {t("codeEditor.reportIssue")}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

