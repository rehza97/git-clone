import { shouldIgnorePath } from "@/lib/uploadIgnore"

/**
 * Collect files from a drag-and-drop operation, including nested folders
 * (FileSystemEntry API). Sets webkitRelativePath on each File for path layout.
 */
export async function collectFilesFromDataTransfer(
  items: DataTransferItemList
): Promise<File[]> {
  const out: File[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const entry = item.webkitGetAsEntry?.()
    if (entry) {
      await walkEntry(entry, entry.name, out)
    } else {
      const file = item.getAsFile()
      if (file) {
        Object.defineProperty(file, "webkitRelativePath", {
          value: file.name,
          configurable: true,
        })
        out.push(file)
      }
    }
  }
  return out
}

async function walkEntry(
  entry: FileSystemEntry,
  relativePath: string,
  out: File[]
): Promise<void> {
  if (shouldIgnorePath(relativePath)) return

  if (entry.isFile) {
    const fe = entry as FileSystemFileEntry
    const file = await new Promise<File>((resolve, reject) => fe.file(resolve, reject))
    Object.defineProperty(file, "webkitRelativePath", {
      value: relativePath,
      configurable: true,
    })
    out.push(file)
    return
  }

  const de = entry as FileSystemDirectoryEntry
  const reader = de.createReader()
  const children: FileSystemEntry[] = []
  let batch: FileSystemEntry[]
  do {
    batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject))
    children.push(...batch)
  } while (batch.length > 0)

  for (const child of children) {
    const childPath = `${relativePath}/${child.name}`
    await walkEntry(child, childPath, out)
  }
}
