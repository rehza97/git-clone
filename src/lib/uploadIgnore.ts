const IGNORE_FOLDERS = new Set([
  "node_modules",
  "__pycache__",
  ".git",
  "dist",
  "build",
  ".next",
  "venv",
  "env",
  ".venv",
  "vendor",
  "target",
  ".idea",
  ".vscode",
  ".cache",
  "coverage",
  ".nyc_output",
  ".turbo",
])

const IGNORE_FILES = new Set([
  ".env",
  ".ds_store",
])

const IGNORE_FILE_PREFIXES = [".env."]
const IGNORE_FILE_SUFFIXES = [".log", ".exe", ".dll", ".dylib", ".so"]

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const BLOCKED_EXTENSIONS = new Set([".exe", ".dll", ".bat", ".cmd", ".sh"])

export function shouldIgnorePath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/").toLowerCase()
  const parts = normalized.split("/")
  for (const part of parts) {
    if (IGNORE_FOLDERS.has(part)) return true
  }
  const base = parts[parts.length - 1] ?? ""
  if (IGNORE_FILES.has(base)) return true
  if (IGNORE_FILE_PREFIXES.some((p) => base.startsWith(p))) return true
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : ""
  if (BLOCKED_EXTENSIONS.has(ext)) return true
  if (IGNORE_FILE_SUFFIXES.some((s) => base.endsWith(s))) return true
  return false
}

export function isFileSizeAllowed(size: number): boolean {
  return size <= MAX_FILE_SIZE_BYTES
}

export const MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES
