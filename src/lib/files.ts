import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/config/firebase"
import { buildStoragePath } from "@/types/schema"
import type { RepoFile } from "@/types/schema"

const FILES = "files"

export interface RepoFileWithId extends RepoFile {
  id: string
}

export async function uploadFile(
  userId: string,
  repoId: string,
  filePath: string,
  file: File
): Promise<void> {
  const storagePath = buildStoragePath(userId, repoId, filePath)
  const storageRef = ref(storage, storagePath)
  await uploadBytes(storageRef, file)
  const filesRef = collection(db, "repos", repoId, FILES)
  await addDoc(filesRef, {
    name: filePath.split("/").pop() ?? file.name,
    path: filePath,
    storagePath,
    size: file.size,
    uploadedAt: serverTimestamp(),
  })
}

export async function listRepoFiles(repoId: string): Promise<RepoFileWithId[]> {
  const filesRef = collection(db, "repos", repoId, FILES)
  const snap = await getDocs(filesRef)
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as RepoFileWithId))
}

export async function getFileDownloadUrl(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath)
  return getDownloadURL(storageRef)
}

export async function deleteRepoFile(repoId: string, fileId: string): Promise<void> {
  const fileRef = doc(db, "repos", repoId, FILES, fileId)
  await deleteDoc(fileRef)
}
