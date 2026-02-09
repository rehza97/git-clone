import { FileCode, FileText, File, type LucideIcon } from "lucide-react"

const EXT_ICON: Record<string, LucideIcon> = {
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  py: FileCode,
  json: FileCode,
  md: FileText,
  html: FileCode,
  css: FileCode,
}

export function getFileIcon(fileName: string): LucideIcon {
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase() : ""
  return EXT_ICON[ext] ?? File
}
