import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { listRepoFiles } from "@/lib/files"
import { shouldIgnorePath, isFileSizeAllowed } from "@/lib/uploadIgnore"
import { buildStoragePath } from "@/types/schema"
import { ref, uploadBytes } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { storage, db } from "@/config/firebase"
import { detectLanguagesFromPaths } from "@/lib/techDetect"
import { updateRepo } from "@/lib/repos"

export function UploadPage() {
  const { repoId } = useParams<{ repoId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
        setError(`الملف كبير جداً: ${f.name}`)
        continue
      }
      allowed.push(f)
    }
    setFiles((prev) => [...prev, ...allowed])
    setError(null)
    e.target.value = ""
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
      navigate(`/repo/${repoId}`)
    } catch (err) {
      setError("حدث خطأ أثناء الرفع.")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">رفع ملفات</h1>
      {error && (
        <p className="mb-4 text-destructive text-sm">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleSelect}
        {...(typeof window !== "undefined" && (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker
          ? {}
          : { webkitdirectory: "", directory: "" })}
      />
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          اختر ملفات أو مجلد
        </Button>
        {files.length > 0 && (
          <>
            <p className="text-muted-foreground text-sm">
              {files.length} ملف (يتم استبعاد node_modules و .env وغيرها تلقائياً)
            </p>
            <ul className="max-h-48 list-inside list-disc overflow-y-auto text-sm">
              {files.slice(0, 50).map((f, i) => (
                <li key={i} className="truncate">
                  {(f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name}
                </li>
              ))}
              {files.length > 50 && <li>... و {files.length - 50} غيرها</li>}
            </ul>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? `جاري الرفع ${progress}%` : "رفع"}
            </Button>
            {uploading && <Progress value={progress} />}
          </>
        )}
      </div>
    </div>
  )
}
