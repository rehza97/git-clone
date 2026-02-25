import { useState, useEffect } from "react"
import { useParams, useLocation, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useRepo } from "@/hooks/useRepo"
import { listRepoFiles, getFileDownloadUrl } from "@/lib/files"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { markdownComponents } from "@/components/MarkdownImage"
import { SourceCodeViewer } from "@/components/SourceCodeViewer"
import { Lock, ArrowLeft } from "lucide-react"

const MD_EXT = new Set(["md", "markdown"])
function isMarkdownPath(path: string): boolean {
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1).toLowerCase() : ""
  return MD_EXT.has(ext)
}

const BORDER_DARK = "#233648"
const TEXT_MUTED = "#92adc9"

export function FileViewerPage() {
  const { t } = useTranslation()
  const { repoId } = useParams<{ repoId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { repo, loading: repoLoading } = useRepo(repoId)
  const [content, setContent] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pathname = location.pathname
  const filePath = pathname.includes("/file/")
    ? decodeURIComponent(pathname.split("/file/")[1] ?? "").replace(/^\//, "")
    : ""

  useEffect(() => {
    if (!repoId || !filePath) {
      setError(t("fileViewer.invalidPath"))
      return
    }
    if (repo && repo.visibility === "private" && user?.uid !== repo.ownerId) {
      navigate("/login")
      return
    }
    let cancelled = false
    listRepoFiles(repoId)
      .then((files) => {
        const file = files.find((f) => f.path === filePath)
        if (!file) {
          if (!cancelled) setError(t("fileViewer.fileNotFound"))
          return
        }
        getFileDownloadUrl(file.storagePath).then((url) => {
          if (cancelled) return
          setDownloadUrl(url)
          fetch(url)
            .then((r) => r.text())
            .then((text) => {
              if (!cancelled) setContent(text)
            })
            .catch(() => {
              if (!cancelled) setContent(null)
              setError(t("fileViewer.failedLoad"))
            })
        })
      })
      .catch(() => {
        if (!cancelled) setError(t("fileViewer.failedLoadFile"))
      })
    return () => {
      cancelled = true
    }
  }, [repoId, filePath, repo, user?.uid, navigate])

  if (repoLoading || !repoId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#101922]">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  if (error || !repo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background dark:bg-[#101922]">
        <p className="text-destructive">{error ?? t("fileViewer.fileNotFound")}</p>
        <Button variant="outline" asChild>
          <Link to={`/repo/${repoId}`}>
            <ArrowLeft className="size-4 mr-2" />
            {t("fileViewer.backToRepo")}
          </Link>
        </Button>
      </div>
    )
  }

  const breadcrumbParts = filePath.split("/").filter(Boolean)
  const isCodeFile = !isMarkdownPath(filePath)

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#101922]">
      {/* Header: breadcrumb + back */}
      <header
        className="flex items-center justify-between border-b px-4 md:px-6 py-3 h-14 shrink-0 z-20 bg-[#161b22]"
        style={{ borderColor: BORDER_DARK }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground hover:text-foreground" asChild>
            <Link to={`/repo/${repoId}`}>
              <ArrowLeft className="size-4 mr-1" />
              {t("fileViewer.repository")}
            </Link>
          </Button>
          <nav className="hidden sm:flex items-center gap-2 text-sm min-w-0 truncate" aria-label="Breadcrumb">
            <Link to={`/repo/${repoId}`} className="truncate font-medium text-foreground hover:text-primary transition-colors">
              {repo.name}
            </Link>
            {breadcrumbParts.map((segment, i) => (
              <span key={i} className="flex items-center gap-2 shrink-0">
                <span style={{ color: TEXT_MUTED }}>/</span>
                {i === breadcrumbParts.length - 1 ? (
                  <span className="font-medium text-foreground flex items-center gap-2 truncate max-w-[200px] md:max-w-none">
                    <Lock className="size-4 text-primary shrink-0" />
                    {segment}
                  </span>
                ) : (
                  <span style={{ color: TEXT_MUTED }}>{segment}</span>
                )}
              </span>
            ))}
          </nav>
          <span className="sm:hidden font-mono text-sm text-muted-foreground truncate max-w-[180px]">{filePath}</span>
        </div>
      </header>

      {/* Main: code viewer or markdown */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        {content != null ? (
          isCodeFile ? (
            <div className="flex-1 flex flex-col min-h-0 p-4 md:p-6">
              <SourceCodeViewer
                code={content}
                filePath={filePath}
                rawUrl={downloadUrl}
                downloadUrl={downloadUrl}
                showToolbar
                showStats
                className="flex-1 min-h-[400px]"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <div className="rounded-lg border overflow-hidden bg-card" style={{ borderColor: BORDER_DARK }}>
                <div className="px-4 py-3 border-b bg-muted/50" style={{ borderColor: BORDER_DARK }}>
                  <span className="text-sm font-semibold text-foreground">{filePath}</span>
                  {downloadUrl && (
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                          {t("fileViewer.raw")}
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={downloadUrl} download>
                          {t("fileViewer.download")}
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-4 prose prose-sm dark:prose-invert max-w-none w-full min-w-0 prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-slate-900 dark:prose-pre:bg-black prose-pre:border prose-pre:border-[#233648] prose-pre:text-green-400 prose-a:text-primary prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto [&_img]:max-w-full [&_img]:h-auto">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>{content}</ReactMarkdown>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        )}
      </main>
    </div>
  )
}
