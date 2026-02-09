import { useState, useEffect } from "react"
import { useParams, useLocation, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useRepo } from "@/hooks/useRepo"
import { listRepoFiles, getFileDownloadUrl } from "@/lib/files"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { CodeBlock } from "@/components/CodeBlock"

export function FileViewerPage() {
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
      setError("مسار الملف غير صحيح.")
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
          if (!cancelled) setError("الملف غير موجود.")
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
              setError("تعذر تحميل المحتوى.")
            })
        })
      })
      .catch(() => {
        if (!cancelled) setError("تعذر تحميل الملف.")
      })
    return () => {
      cancelled = true
    }
  }, [repoId, filePath, repo, user?.uid, navigate])

  if (repoLoading || !repoId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">{error}</p>
        <Button variant="link" asChild>
          <Link to={`/repo/${repoId}`}>العودة للمستودع</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/repo/${repoId}`}>← المستودع</Link>
        </Button>
        <span className="font-mono text-muted-foreground text-sm">{filePath}</span>
        {downloadUrl && (
          <>
            <Button variant="outline" size="sm" asChild>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                عرض خام
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={downloadUrl} download>
                تنزيل
              </a>
            </Button>
          </>
        )}
      </div>
      <div className="rounded-md border border-border overflow-hidden">
        {content != null ? (
          <CodeBlock code={content} filePath={filePath} />
        ) : (
          <pre className="bg-muted/30 p-4 text-sm">جاري التحميل...</pre>
        )}
      </div>
    </div>
  )
}
