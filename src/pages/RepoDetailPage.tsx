import { useEffect, useState } from "react"
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/contexts/AuthContext"
import { useRepo } from "@/hooks/useRepo"
import { listRepoFiles, getFileDownloadUrl, type RepoFileWithId } from "@/lib/files"
import { buildFileTree, type TreeNode } from "@/lib/fileTree"
import { CodeBlock } from "@/components/CodeBlock"
import ReactMarkdown from "react-markdown"
import { ChevronRightIcon, ChevronsUpIcon, FolderIcon } from "lucide-react"
import { getFileIcon } from "@/lib/fileIcons"

const INDENT_PER_LEVEL = 16

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp", "avif"])
const VIDEO_EXT = new Set(["mp4", "webm", "ogg", "mov", "avi", "mkv", "m4v"])
const AUDIO_EXT = new Set(["mp3", "wav", "ogg", "m4a", "aac", "flac", "weba", "opus"])
const PDF_EXT = new Set(["pdf"])

type PreviewKind = "image" | "video" | "audio" | "pdf"

function getPreviewKind(path: string): PreviewKind | null {
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1).toLowerCase() : ""
  if (IMAGE_EXT.has(ext)) return "image"
  if (VIDEO_EXT.has(ext)) return "video"
  if (AUDIO_EXT.has(ext)) return "audio"
  if (PDF_EXT.has(ext)) return "pdf"
  return null
}

function FileTree({
  tree,
  repoId,
  selectedPath,
  onSelectFile,
  openFolders,
  onFolderOpenChange,
  depth = 0,
}: {
  tree: TreeNode
  repoId: string
  selectedPath: string | null
  onSelectFile: (path: string) => void
  openFolders: Set<string>
  onFolderOpenChange: (path: string, open: boolean) => void
  depth?: number
}) {
  const indentStyle = { paddingRight: depth * INDENT_PER_LEVEL } as const

  if (tree.isFile) {
    const Icon = getFileIcon(tree.name)
    const isSelected = selectedPath === tree.path
    return (
      <div style={indentStyle}>
        <button
          type="button"
          onClick={() => onSelectFile(tree.path)}
          className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors touch-manipulation ${isSelected ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        >
          <Icon className="size-4 shrink-0 opacity-80" />
          <span className="truncate">{tree.name}</span>
        </button>
      </div>
    )
  }
  if (tree.children.length === 0) return null
  const isOpen = openFolders.has(tree.path)
  return (
    <div style={indentStyle} className="min-w-0">
      <Collapsible
        open={isOpen}
        onOpenChange={(open) => onFolderOpenChange(tree.path, open)}
        className="group/collapse"
      >
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent [&_svg]:shrink-0">
          <ChevronRightIcon className="size-4 transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
          <FolderIcon className="size-4 text-amber-500/90 dark:text-amber-400/90" />
          <span className="truncate font-medium">{tree.name || "الجذر"}</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-r-2 border-border/60 mr-1 mt-0.5 pr-1">
          {tree.children.map((child) => (
            <FileTree
              key={child.path}
              tree={child}
              repoId={repoId}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
              openFolders={openFolders}
              onFolderOpenChange={onFolderOpenChange}
              depth={depth + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export function RepoDetailPage() {
  const { repoId } = useParams<{ repoId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { repo, loading, error } = useRepo(repoId)
  const [files, setFiles] = useState<RepoFileWithId[]>([])
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [filePreviewKind, setFilePreviewKind] = useState<PreviewKind | null>(null)
  const [fileContentLoading, setFileContentLoading] = useState(false)
  const [fileContentError, setFileContentError] = useState<string | null>(null)
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set())

  const selectedPath = searchParams.get("file")

  const handleFolderOpenChange = (path: string, open: boolean) => {
    setOpenFolders((prev) => {
      const next = new Set(prev)
      if (open) next.add(path)
      else next.delete(path)
      return next
    })
  }

  const collapseAllFolders = () => setOpenFolders(new Set())

  const setSelectedFile = (path: string | null) => {
    if (path) {
      setSearchParams({ file: path }, { replace: true })
    } else {
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
    if (!repoId || !selectedPath) {
      setFileContent(null)
      setFilePreviewUrl(null)
      setFilePreviewKind(null)
      setFileContentError(null)
      return
    }
    const file = files.find((f) => f.path === selectedPath)
    if (!file) {
      setFileContentError("الملف غير موجود.")
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
          setFileContentError("تعذر تحميل المحتوى.")
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
        .then((text) => {
          setFileContent(text)
        })
        .catch(() => {
          setFileContentError("تعذر تحميل المحتوى.")
          setFileContent(null)
        })
        .finally(() => setFileContentLoading(false))
    }
  }, [repoId, selectedPath, files])

  useEffect(() => {
    if (repo && repo.visibility === "private" && user?.uid !== repo.ownerId) {
      navigate("/login")
    }
  }, [repo, user?.uid, navigate])

  if (loading || !repoId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }
  if (error || !repo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">المستودع غير موجود.</p>
        <Button variant="link" asChild>
          <Link to="/">العودة للرئيسية</Link>
        </Button>
      </div>
    )
  }

  const isOwner = user?.uid === repo.ownerId

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{repo.name}</h1>
          <Badge variant={repo.visibility === "public" ? "default" : "secondary"} className="shrink-0">
            {repo.visibility === "public" ? "عام" : "خاص"}
          </Badge>
          {repo.languages?.map((lang) => (
            <Badge key={lang} variant="outline" className="shrink-0 font-normal">
              {lang}
            </Badge>
          ))}
          {isOwner && (
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link to={`/repo/${repoId}/upload`}>رفع ملفات</Link>
            </Button>
          )}
        </div>
        {repo.description && (
          <p className="mt-3 text-muted-foreground leading-relaxed">{repo.description}</p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">الملفات</h2>
            {tree && tree.children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={collapseAllFolders}
                title="طي كل المجلدات"
              >
                <ChevronsUpIcon className="size-4" />
                <span className="mr-1 text-xs">طي الكل</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {tree && tree.children.length > 0 ? (
              <div className="max-h-[min(70vh,600px)] overflow-y-auto p-2">
                {tree.children.map((child) => (
                  <FileTree
                    key={child.path}
                    tree={child}
                    repoId={repoId!}
                    selectedPath={selectedPath}
                    onSelectFile={setSelectedFile}
                    openFolders={openFolders}
                    onFolderOpenChange={handleFolderOpenChange}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm">لا ملفات بعد.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
            <h2 className="min-w-0 truncate text-sm font-semibold text-foreground" title={selectedPath ?? undefined}>
              {selectedPath ? (
                <span className="font-mono text-xs">{selectedPath}</span>
              ) : (
                "القراءة"
              )}
            </h2>
            {selectedPath && (
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setSelectedFile(null)}>
                عرض القراءة
              </Button>
            )}
          </CardHeader>
          <CardContent className="min-h-[min(70vh,600px)] flex flex-1 flex-col overflow-hidden p-0">
            {selectedPath ? (
              <div className="flex flex-1 flex-col overflow-hidden p-4">
                {fileContentError && (
                  <p className="mb-3 text-sm text-destructive">{fileContentError}</p>
                )}
                {fileContentLoading && (
                  <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/30 p-8">
                    <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                  </div>
                )}
                {!fileContentLoading && filePreviewUrl && filePreviewKind && (
                  <div className="flex flex-1 flex-col items-center overflow-auto rounded-lg border border-border bg-muted/20 p-4">
                    {filePreviewKind === "image" && (
                      <img
                        src={filePreviewUrl}
                        alt={selectedPath ?? ""}
                        className="max-h-[min(70vh,600px)] max-w-full rounded object-contain"
                      />
                    )}
                    {filePreviewKind === "video" && (
                      <video
                        src={filePreviewUrl}
                        controls
                        className="max-h-[min(70vh,600px)] max-w-full rounded"
                        preload="metadata"
                      />
                    )}
                    {filePreviewKind === "audio" && (
                      <audio src={filePreviewUrl} controls className="w-full max-w-md" preload="metadata" />
                    )}
                    {filePreviewKind === "pdf" && (
                      <iframe
                        src={filePreviewUrl}
                        title={selectedPath ?? "PDF"}
                        className="h-[min(70vh,600px)] w-full min-h-[400px] rounded border-0"
                      />
                    )}
                  </div>
                )}
                {!fileContentLoading && fileContent != null && !filePreviewUrl && (
                  <div className="flex-1 overflow-auto rounded-lg border border-border">
                    <CodeBlock code={fileContent} filePath={selectedPath} />
                  </div>
                )}
                {!fileContentLoading && fileContent == null && !filePreviewUrl && !fileContentError && (
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    اختر ملفاً من القائمة.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-4">
                {repo.readme ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-muted/30 prose-pre:border prose-pre:border-border">
                    <ReactMarkdown>{repo.readme}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[200px] items-center justify-center text-center">
                    <p className="text-muted-foreground text-sm">
                      {files.length === 0 && isOwner
                        ? "ارفع ملفات أو أضف README في الإعدادات."
                        : "اختر ملفاً من القائمة لعرضه هنا."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
