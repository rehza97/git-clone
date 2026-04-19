import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ChevronRight,
  CloudUpload,
  GitBranch,
  Folder,
  Info,
  Upload,
  Flag,
  ShieldCheck,
  History,
  Key,
  Bug,
  ArrowRight,
  Globe,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { getRepo } from "@/lib/repos"
import { listRepoFiles } from "@/lib/files"
import {
  extractRootGitignoreText,
  shouldIgnorePath,
  isFileSizeAllowed,
} from "@/lib/uploadIgnore"
import { collectFilesFromDataTransfer } from "@/lib/dragDropFiles"
import { buildStoragePath } from "@/types/schema"
import { ref, uploadBytesResumable } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { storage, db } from "@/config/firebase"
import { detectLanguagesFromPaths } from "@/lib/techDetect"
import { updateRepo } from "@/lib/repos"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type UploadMethod = "direct" | "git"
type DirectUploadMode = "files" | "folders"

function fileToStorageRelative(file: File): string {
  const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
  return path.replace(/^[^/]+?\//, "").replace(/\\/g, "/")
}

export function UploadPage() {
  const { t } = useTranslation()
  const { repoId } = useParams<{ repoId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [repoName, setRepoName] = useState<string | null>(null)

  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("direct")
  const [branch, setBranch] = useState("main")
  const [versionTag, setVersionTag] = useState("")
  const [commitMessage, setCommitMessage] = useState("")

  const [files, setFiles] = useState<File[]>([])
  const [directUploadMode, setDirectUploadMode] = useState<DirectUploadMode>("folders")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)
  const [currentRelativePath, setCurrentRelativePath] = useState<string | null>(null)
  const [stagingSummary, setStagingSummary] = useState<{ added: number; skipped: number } | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!repoId) return
    getRepo(repoId).then((repo) => setRepoName(repo?.name ?? null))
  }, [repoId])

  if (!user || !repoId) {
    navigate("/dashboard")
    return null
  }

  async function processIncomingFiles(selected: File[]) {
    if (selected.length === 0) return
    setError(null)
    const extraGitignore = await extractRootGitignoreText(selected)
    let skipped = 0
    const next: File[] = []
    for (const f of selected) {
      const wp = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
      if (shouldIgnorePath(wp, extraGitignore)) {
        skipped++
        continue
      }
      if (!isFileSizeAllowed(f.size)) {
        setError(t("upload.fileTooLarge", { name: f.name }))
        skipped++
        continue
      }
      next.push(f)
    }
    setFiles((prev) => [...prev, ...next])
    setStagingSummary({ added: next.length, skipped })
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    e.target.value = ""
    void processIncomingFiles(selected)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const items = e.dataTransfer?.items
    if (!items?.length) return
    void (async () => {
      try {
        const selected = await collectFilesFromDataTransfer(items)
        await processIncomingFiles(selected)
      } catch {
        setError(t("upload.errorUpload"))
      }
    })()
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  async function handleUpload() {
    if (!user || !repoId || files.length === 0) return
    setUploading(true)
    setError(null)
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0) || 1
    let completedBytes = 0
    setProgress(0)
    try {
      const paths: string[] = []
      for (const file of files) {
        setCurrentFileName(file.name)
        const normalized = fileToStorageRelative(file)
        setCurrentRelativePath(normalized)
        paths.push(normalized)
        const storagePath = buildStoragePath(user.uid, repoId, normalized)
        const storageRef = ref(storage, storagePath)
        const task = uploadBytesResumable(storageRef, file)
        await new Promise<void>((resolve, reject) => {
          task.on(
            "state_changed",
            (snap) => {
              const transferred = completedBytes + snap.bytesTransferred
              setProgress(Math.min(100, Math.round((transferred / totalBytes) * 100)))
            },
            (err) => reject(err),
            () => resolve()
          )
        })
        await addDoc(collection(db, "repos", repoId, "files"), {
          name: file.name,
          path: normalized,
          storagePath,
          size: file.size,
          uploadedAt: serverTimestamp(),
        })
        completedBytes += file.size
        setProgress(Math.min(100, Math.round((completedBytes / totalBytes) * 100)))
      }
      const existingFiles = await listRepoFiles(repoId)
      const allPaths = [...paths, ...existingFiles.map((f) => f.path)]
      const languages = detectLanguagesFromPaths(allPaths)
      if (languages.length > 0) {
        await updateRepo(repoId, { languages })
      }
      setFiles([])
      setStagingSummary(null)
      setProgress(100)
      setCurrentFileName(null)
      setCurrentRelativePath(null)
      navigate(`/repo/${repoId}`)
    } catch {
      setError(t("upload.errorUpload"))
    } finally {
      setUploading(false)
      setProgress(0)
      setCurrentFileName(null)
      setCurrentRelativePath(null)
    }
  }

  function handleCancel() {
    setFiles([])
    setStagingSummary(null)
    setError(null)
    navigate(`/repo/${repoId}`)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-surface-page text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-[1200px] flex-1 flex-col gap-6 px-4 py-5 md:px-10 lg:px-16">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-subtle-fg"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-500 dark:text-subtle-fg" />
          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-subtle-fg"
          >
            {t("upload.myProjects")}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-500 dark:text-subtle-fg" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {repoName ?? t("upload.uploadRepository")}
          </span>
        </nav>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main upload section */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {t("upload.archiveAndUpload")}
              </h1>
              <p className="text-lg font-normal leading-normal text-slate-600 dark:text-subtle-fg">
                {t("upload.archiveSubtitle")}
              </p>
            </div>

            {/* Upload method selection */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("upload.chooseMethod")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="upload_method"
                    className="peer sr-only"
                    checked={uploadMethod === "direct"}
                    disabled={uploading}
                    onChange={() => setUploadMethod("direct")}
                  />
                  <div
                    className={cn(
                      "flex h-full flex-col gap-3 rounded-xl border p-5 transition-all",
                      "border-slate-200 dark:border-border-strong bg-white dark:bg-surface-muted",
                      "hover:bg-slate-50 dark:hover:bg-surface-muted/90",
                      "peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <CloudUpload className="h-6 w-6" />
                      </div>
                      <div className="h-5 w-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary [.peer:checked+&]:bg-primary [.peer:checked+&]:border-primary">
                        {uploadMethod === "direct" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h2 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
                        {t("upload.directUpload")}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-subtle-fg">
                        {t("upload.directUploadDesc")}
                      </p>
                    </div>
                  </div>
                </label>
                <label className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="upload_method"
                    className="peer sr-only"
                    checked={uploadMethod === "git"}
                    disabled={uploading}
                    onChange={() => setUploadMethod("git")}
                  />
                  <div
                    className={cn(
                      "flex h-full flex-col gap-3 rounded-xl border p-5 transition-all",
                      "border-slate-200 dark:border-border-strong bg-white dark:bg-surface-muted",
                      "hover:bg-slate-50 dark:hover:bg-surface-muted/90",
                      "peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <GitBranch className="h-6 w-6" />
                      </div>
                      <div className="h-5 w-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        {uploadMethod === "git" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h2 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
                        {t("upload.connectGit")}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-subtle-fg">
                        {t("upload.connectGitDesc")}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Drop zone */}
            {uploadMethod === "direct" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={directUploadMode === "files" ? "default" : "outline"}
                    disabled={uploading}
                    onClick={() => setDirectUploadMode("files")}
                  >
                    {t("upload.uploadFilesOption")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={directUploadMode === "folders" ? "default" : "outline"}
                    disabled={uploading}
                    onClick={() => setDirectUploadMode("folders")}
                  >
                    {t("upload.uploadFoldersOption")}
                  </Button>
                </div>
                <p className="text-sm text-slate-600 dark:text-subtle-fg">
                  {directUploadMode === "folders"
                    ? t("upload.folderNotZipHint")
                    : t("upload.filesOnlyHint")}
                </p>
                <div
                  aria-busy={uploading}
                  className={cn(
                    "group relative flex cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-16 transition-colors dark:border-border-strong dark:bg-surface-page hover:border-primary dark:hover:border-primary",
                    uploading && "pointer-events-none opacity-60"
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {/* pointer-events-none: all clicks go to the file input overlay; avoids double
                      picker (native input click + parent onClick firing on bubble). */}
                  <div className="pointer-events-none flex flex-col items-center justify-center gap-6">
                    <div className="flex size-16 items-center justify-center rounded-full bg-slate-200 transition-transform duration-300 group-hover:scale-110 dark:bg-surface-muted">
                      <Folder className="h-10 w-10 text-slate-500 dark:text-subtle-fg" />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {t("upload.dragDropFilesOrFolders")}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-subtle-fg">
                        {t("upload.orBrowse")}{" "}
                        <span className="text-primary hover:underline">
                          {directUploadMode === "folders"
                            ? t("upload.browseFolders")
                            : t("upload.browseFiles")}
                        </span>{" "}
                        {t("upload.browseFilesSuffix")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 dark:bg-surface-muted">
                      <Info className="h-4 w-4 text-slate-500 dark:text-subtle-fg" />
                      <span className="text-xs font-medium text-slate-500 dark:text-subtle-fg">
                        {t("upload.maxFileSize")}
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    disabled={uploading}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    onChange={handleSelect}
                    {...(directUploadMode === "folders"
                      ? ({
                          webkitdirectory: "",
                          directory: "",
                        } as React.InputHTMLAttributes<HTMLInputElement>)
                      : {})}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {stagingSummary !== null && (
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t("upload.stagingSummary", {
                      added: stagingSummary.added,
                      skipped: stagingSummary.skipped,
                    })}
                  </p>
                )}
                {files.length > 0 && (
                  <p className="text-sm text-slate-500 dark:text-subtle-fg">
                    {t("upload.filesCount", { count: files.length })}
                  </p>
                )}
              </div>
            )}

            {/* Git branch & message card */}
            <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-border-strong dark:bg-surface-muted">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("upload.targetBranch")}
                  </Label>
                  <select
                    aria-label={t("upload.targetBranch")}
                    disabled={uploading}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-primary focus:ring-primary disabled:opacity-50 dark:border-border-strong dark:bg-code-bg dark:text-white"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <option value="main">main</option>
                    <option value="develop">develop</option>
                    <option value="feature/upload-v1">feature/upload-v1</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("upload.versionTag")}
                  </Label>
                  <input
                    type="text"
                    disabled={uploading}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary disabled:opacity-50 dark:border-border-strong dark:bg-code-bg dark:text-white"
                    placeholder={t("upload.versionTagPlaceholder")}
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("upload.commitMessage")}
                </Label>
                <textarea
                  disabled={uploading}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary disabled:opacity-50 dark:border-border-strong dark:bg-code-bg dark:text-white"
                  placeholder={t("upload.commitMessagePlaceholder")}
                  rows={3}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                />
              </div>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 dark:border-primary/40 dark:bg-primary/10">
                <div className="flex justify-between text-sm text-slate-600 dark:text-subtle-fg">
                  <span className="min-w-0 flex-1 pr-2 font-medium text-slate-900 dark:text-white">
                    {t("upload.uploadingFile", {
                      name: currentFileName ?? "...",
                    })}
                  </span>
                  <span className="shrink-0 tabular-nums">{progress}%</span>
                </div>
                {currentRelativePath && (
                  <p className="truncate font-mono text-xs text-slate-500 dark:text-subtle-fg">
                    {currentRelativePath}
                  </p>
                )}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={uploading}
                className="rounded-lg border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-border-strong dark:text-white dark:hover:bg-surface-muted"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={
                  uploading ||
                  (uploadMethod === "direct" && files.length === 0) ||
                  uploadMethod === "git"
                }
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-blue-600"
              >
                {uploading ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                ) : (
                  <Upload className="h-[18px] w-[18px]" aria-hidden />
                )}
                {uploading ? t("upload.uploadingProgress", { progress }) : t("upload.startUpload")}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* National Digital Sovereignty */}
            <div className="relative overflow-hidden rounded-xl border border-border-strong bg-gradient-to-br from-surface to-surface-page p-6">
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Globe className="h-[120px] w-[120px] text-white" />
              </div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Flag className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {t("upload.nationalSovereignty")}
                </h3>
                <p className="text-sm leading-relaxed text-subtle-fg">
                  {t("upload.nationalSovereigntyDesc")}
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded border border-border-strong bg-surface-muted px-2 py-1 font-mono text-xs text-subtle-fg">
                    {t("upload.locallyHosted")}
                  </span>
                  <span className="rounded border border-border-strong bg-surface-muted px-2 py-1 font-mono text-xs text-subtle-fg">
                    {t("upload.aes256")}
                  </span>
                </div>
              </div>
            </div>

            {/* Archival Standards */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-border-strong dark:bg-surface-muted">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                {t("upload.archivalStandards")}
              </h3>
              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <History className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      {t("upload.immutableHistory")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-subtle-fg">
                      {t("upload.immutableHistoryDesc")}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Key className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      {t("upload.accessControl")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-subtle-fg">
                      {t("upload.accessControlDesc")}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Bug className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      {t("upload.vulnerabilityScan")}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-subtle-fg">
                      {t("upload.vulnerabilityScanDesc")}
                    </span>
                  </div>
                </li>
              </ul>
              <Link
                to="/docs"
                className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {t("upload.readSecurityPolicy")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
