import { useState, useRef, useEffect } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { getRepo } from "@/lib/repos"
import { listRepoFiles } from "@/lib/files"
import { shouldIgnorePath, isFileSizeAllowed } from "@/lib/uploadIgnore"
import { buildStoragePath } from "@/types/schema"
import { ref, uploadBytes } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { storage, db } from "@/config/firebase"
import { detectLanguagesFromPaths } from "@/lib/techDetect"
import { updateRepo } from "@/lib/repos"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type UploadMethod = "direct" | "git"

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
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!repoId) return
    getRepo(repoId).then((repo) => setRepoName(repo?.name ?? null))
  }, [repoId])

  if (!user || !repoId) {
    navigate("/dashboard")
    return null
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const allowed: File[] = []
    for (const f of selected) {
      const path = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
      if (shouldIgnorePath(path)) continue
      if (!isFileSizeAllowed(f.size)) {
        setError(t("upload.fileTooLarge", { name: f.name }))
        continue
      }
      allowed.push(f)
    }
    setFiles((prev) => [...prev, ...allowed])
    setError(null)
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const items = e.dataTransfer?.items
    if (!items) return
    const selected: File[] = []
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.()
      if (entry?.isFile) {
        const file = items[i].getAsFile()
        if (file) selected.push(file)
      }
    }
    const allowed: File[] = []
    for (const f of selected) {
      const path = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
      if (shouldIgnorePath(path)) continue
      if (!isFileSizeAllowed(f.size)) {
        setError(t("upload.fileTooLarge", { name: f.name }))
        continue
      }
      allowed.push(f)
    }
    setFiles((prev) => [...prev, ...allowed])
    setError(null)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  async function handleUpload() {
    if (!user || !repoId || files.length === 0) return
    setUploading(true)
    setError(null)
    let done = 0
    const total = files.length
    try {
      const paths: string[] = []
      for (const file of files) {
        setCurrentFileName(file.name)
        const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
        const normalized = path.replace(/^[^/]+?\//, "").replace(/\\/g, "/")
        paths.push(normalized)
        const storagePath = buildStoragePath(user.uid, repoId, normalized)
        const storageRef = ref(storage, storagePath)
        await uploadBytes(storageRef, file)
        await addDoc(collection(db, "repos", repoId, "files"), {
          name: file.name,
          path: normalized,
          storagePath,
          size: file.size,
          uploadedAt: serverTimestamp(),
        })
        done++
        setProgress(Math.round((done / total) * 100))
      }
      const existingFiles = await listRepoFiles(repoId)
      const allPaths = [...paths, ...existingFiles.map((f) => f.path)]
      const languages = detectLanguagesFromPaths(allPaths)
      if (languages.length > 0) {
        await updateRepo(repoId, { languages })
      }
      setFiles([])
      setProgress(100)
      setCurrentFileName(null)
      navigate(`/repo/${repoId}`)
    } catch (err) {
      setError(t("upload.errorUpload"))
    } finally {
      setUploading(false)
      setProgress(0)
      setCurrentFileName(null)
    }
  }

  function handleCancel() {
    setFiles([])
    setError(null)
    navigate(`/repo/${repoId}`)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#101922] text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-[1200px] flex-1 flex-col gap-6 px-4 py-5 md:px-10 lg:px-16">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-[#92adc9]"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-500 dark:text-[#92adc9]" />
          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-[#92adc9]"
          >
            {t("upload.myProjects")}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-500 dark:text-[#92adc9]" />
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
              <p className="text-lg font-normal leading-normal text-slate-600 dark:text-[#92adc9]">
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
                    onChange={() => setUploadMethod("direct")}
                  />
                  <div
                    className={cn(
                      "flex h-full flex-col gap-3 rounded-xl border p-5 transition-all",
                      "border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#192633]",
                      "hover:bg-slate-50 dark:hover:bg-[#203040]",
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
                      <p className="text-sm text-slate-500 dark:text-[#92adc9]">
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
                    onChange={() => setUploadMethod("git")}
                  />
                  <div
                    className={cn(
                      "flex h-full flex-col gap-3 rounded-xl border p-5 transition-all",
                      "border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#192633]",
                      "hover:bg-slate-50 dark:hover:bg-[#203040]",
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
                      <p className="text-sm text-slate-500 dark:text-[#92adc9]">
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
                <div
                  className="group relative flex cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-16 transition-colors dark:border-[#324d67] dark:bg-[#151f2a] hover:border-primary dark:hover:border-primary"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => inputRef.current?.click()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleSelect}
                    {...(typeof window !== "undefined" &&
                    (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker
                      ? {}
                      : { webkitdirectory: "", directory: "" })}
                  />
                  <div className="flex size-16 items-center justify-center rounded-full bg-slate-200 transition-transform duration-300 group-hover:scale-110 dark:bg-[#233648]">
                    <Folder className="h-10 w-10 text-slate-500 dark:text-[#92adc9]" />
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("upload.dragDrop")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("upload.orBrowse")}{" "}
                      <span className="text-primary hover:underline">{t("upload.browseFiles")}</span>{" "}
                      {t("upload.browseFilesSuffix")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 dark:bg-[#233648]">
                    <Info className="h-4 w-4 text-slate-500 dark:text-[#92adc9]" />
                    <span className="text-xs font-medium text-slate-500 dark:text-[#92adc9]">
                      {t("upload.maxFileSize")}
                    </span>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {files.length > 0 && (
                  <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                    {t("upload.filesCount", { count: files.length })}
                  </p>
                )}
              </div>
            )}

            {/* Git branch & message card */}
            <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-[#324d67] dark:bg-[#192633]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("upload.targetBranch")}
                  </Label>
                  <select
                    aria-label={t("upload.targetBranch")}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-primary focus:ring-primary dark:border-[#324d67] dark:bg-[#111a22] dark:text-white"
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
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-[#324d67] dark:bg-[#111a22] dark:text-white"
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
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-[#324d67] dark:bg-[#111a22] dark:text-white"
                  placeholder={t("upload.commitMessagePlaceholder")}
                  rows={3}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                />
              </div>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm text-slate-500 dark:text-[#92adc9]">
                  <span>
                    {t("upload.uploadingFile", {
                      name: currentFileName ?? "...",
                    })}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#233648]">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
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
                className="rounded-lg border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-[#324d67] dark:text-white dark:hover:bg-[#233648]"
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
                <Upload className="h-[18px] w-[18px]" />
                {uploading ? t("upload.uploadingProgress", { progress }) : t("upload.startUpload")}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* National Digital Sovereignty */}
            <div className="relative overflow-hidden rounded-xl border border-[#324d67] bg-gradient-to-br from-[#1a2c3d] to-[#111a22] p-6">
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
                <p className="text-sm leading-relaxed text-[#92adc9]">
                  {t("upload.nationalSovereigntyDesc")}
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded border border-[#324d67] bg-[#233648] px-2 py-1 text-xs font-mono text-[#92adc9]">
                    {t("upload.locallyHosted")}
                  </span>
                  <span className="rounded border border-[#324d67] bg-[#233648] px-2 py-1 text-xs font-mono text-[#92adc9]">
                    {t("upload.aes256")}
                  </span>
                </div>
              </div>
            </div>

            {/* Archival Standards */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-[#324d67] dark:bg-[#192633]">
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
                    <span className="text-xs text-slate-500 dark:text-[#92adc9]">
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
                    <span className="text-xs text-slate-500 dark:text-[#92adc9]">
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
                    <span className="text-xs text-slate-500 dark:text-[#92adc9]">
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

