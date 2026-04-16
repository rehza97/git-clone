import JSZip from "jszip"
import { getFileDownloadUrl } from "@/lib/files"
import type { RepoFileWithId } from "@/lib/files"

function safeZipBasename(name: string): string {
  const s = name.replace(/[/\\:?*"<>|]/g, "_").trim().slice(0, 120)
  return s || "repository"
}

/**
 * Fetch all repo files from Storage and trigger a single .zip download in the browser.
 */
export async function downloadRepoAsZip(
  repoName: string,
  repoId: string,
  files: RepoFileWithId[],
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  if (files.length === 0) return
  const zip = new JSZip()
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const url = await getFileDownloadUrl(f.storagePath)
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${f.path}`)
    }
    const buf = await res.arrayBuffer()
    const pathInZip = f.path.replace(/^\/+/, "")
    zip.file(pathInZip || f.name || `file-${i}`, buf)
    onProgress?.(i + 1, files.length)
  }
  const blob = await zip.generateAsync({ type: "blob" })
  const base = safeZipBasename(repoName || repoId)
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `${base}.zip`
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}
