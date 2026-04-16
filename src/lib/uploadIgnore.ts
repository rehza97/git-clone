import ignore from "ignore"
import { DEFAULT_UPLOAD_IGNORE_PATTERNS } from "@/lib/uploadIgnorePatterns"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".sh",
])

export function normalizeUploadPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\/+/, "")
}

/**
 * Path relative to the selected root folder (first segment stripped), for gitignore matching.
 * Single-segment paths (no slash) are treated as already at project root.
 */
export function pathWithinUploadRoot(webkitRelativePath: string): string {
  const p = normalizeUploadPath(webkitRelativePath)
  const i = p.indexOf("/")
  if (i === -1) return p
  return p.slice(i + 1)
}

/**
 * Security and storage-alignment rules that user .gitignore must not override.
 */
export function securityAlwaysIgnorePath(normalizedFullPath: string): boolean {
  const lower = normalizedFullPath.toLowerCase()
  const parts = lower.split("/")
  for (const seg of parts) {
    if (seg === ".env" || seg.startsWith(".env.")) return true
  }
  const base = parts[parts.length - 1] ?? ""
  if (base === ".env") return true
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")).toLowerCase() : ""
  if (BLOCKED_EXTENSIONS.has(ext)) return true
  if (base.endsWith(".dylib") || base.endsWith(".so")) return true
  return false
}

function createIgnoreMatcher(extraGitignore?: string) {
  const ig = ignore().add(DEFAULT_UPLOAD_IGNORE_PATTERNS)
  if (extraGitignore?.trim()) {
    try {
      ig.add(extraGitignore)
    } catch {
      // malformed .gitignore content — rely on defaults only
    }
  }
  return ig
}

/**
 * @param path webkitRelativePath or single file name
 * @param extraGitignore optional contents of root `.gitignore` from the project being uploaded
 */
export function shouldIgnorePath(path: string, extraGitignore?: string): boolean {
  const norm = normalizeUploadPath(path)
  if (securityAlwaysIgnorePath(norm)) return true
  const inner = pathWithinUploadRoot(norm)
  const ig = createIgnoreMatcher(extraGitignore)
  return ig.ignores(inner)
}

/** Read root `.gitignore` from a flat list of staged files (one folder tree per picker). */
export async function extractRootGitignoreText(files: File[]): Promise<string | undefined> {
  for (const f of files) {
    const wp = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
    const inner = pathWithinUploadRoot(wp)
    if (inner === ".gitignore") {
      try {
        return await f.text()
      } catch {
        return undefined
      }
    }
  }
  return undefined
}

export function isFileSizeAllowed(size: number): boolean {
  return size <= MAX_FILE_SIZE_BYTES
}

export const MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES
