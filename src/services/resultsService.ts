// Psychotest Results Service - Firestore & Storage operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from 'firebase/storage'
import { getFirebaseFirestore, getFirebaseStorage } from '@/firebase'
import type { PsychotestResult, EntityType } from '@/types/models'
import { markParticipantHasResult } from './participantService'

const COLLECTION_NAME = 'psychotestResults'
const STORAGE_PATH = 'psychotest-results'

export interface UploadProgress {
  bytesTransferred: number
  totalBytes: number
  progress: number
  state: 'running' | 'paused' | 'success' | 'error'
}

/**
 * Upload a psychotest result file
 */
export async function uploadPsychotestResult(
  file: File,
  entityType: EntityType,
  entityId: string,
  entityName: string,
  token: string,
  jenisTest: string,
  tanggalTest: Date,
  uploadedBy: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<PsychotestResult> {
  const storage = getFirebaseStorage()
  const db = getFirebaseFirestore()

  // Generate unique file path
  const timestamp = Date.now()
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `${STORAGE_PATH}/${entityType}/${entityId}/${timestamp}_${sanitizedFileName}`
  const storageRef = ref(storage, filePath)

  // Upload file with progress tracking
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress,
          state: snapshot.state as 'running' | 'paused',
        })
      },
      (error) => {
        onProgress?.({
          bytesTransferred: 0,
          totalBytes: file.size,
          progress: 0,
          state: 'error',
        })
        reject(error)
      },
      async () => {
        try {
          // Get download URL
          const fileURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Create Firestore document
          const resultData: Omit<PsychotestResult, 'id'> = {
            entityType,
            entityId,
            entityName,
            token,
            jenisTest,
            tanggalTest: Timestamp.fromDate(tanggalTest),
            fileURL,
            fileName: file.name,
            fileSize: file.size,
            filePath,
            uploadedAt: serverTimestamp() as unknown as Timestamp,
            uploadedBy,
            downloadCount: 0,
          }

          const docRef = await addDoc(collection(db, COLLECTION_NAME), resultData)

          // Update participant to mark as having result
          if (entityType === 'cpmi') {
            await markParticipantHasResult(entityId, docRef.id)
          }

          onProgress?.({
            bytesTransferred: file.size,
            totalBytes: file.size,
            progress: 100,
            state: 'success',
          })

          resolve({ id: docRef.id, ...resultData })
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

/**
 * Get a psychotest result by ID
 */
export async function getPsychotestResultById(id: string): Promise<PsychotestResult | null> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return { id: docSnap.id, ...docSnap.data() } as PsychotestResult
}

/**
 * Get psychotest results by entity (participant or institution)
 */
export async function getResultsByEntity(
  entityType: EntityType,
  entityId: string
): Promise<PsychotestResult[]> {
  const db = getFirebaseFirestore()
  // Simple query without orderBy to avoid index requirement
  const q = query(
    collection(db, COLLECTION_NAME),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId)
  )
  const querySnapshot = await getDocs(q)

  const results: PsychotestResult[] = []
  querySnapshot.forEach((docSnap) => {
    results.push({ id: docSnap.id, ...docSnap.data() } as PsychotestResult)
  })

  // Sort client-side
  results.sort((a, b) => {
    const aTime = a.uploadedAt?.toMillis() || 0
    const bTime = b.uploadedAt?.toMillis() || 0
    return bTime - aTime
  })

  return results
}

/**
 * Get psychotest results by token
 */
export async function getResultsByToken(token: string): Promise<PsychotestResult[]> {
  const db = getFirebaseFirestore()
  // Simple query without orderBy to avoid index requirement
  const q = query(
    collection(db, COLLECTION_NAME),
    where('token', '==', token)
  )
  const querySnapshot = await getDocs(q)

  const results: PsychotestResult[] = []
  querySnapshot.forEach((docSnap) => {
    results.push({ id: docSnap.id, ...docSnap.data() } as PsychotestResult)
  })

  return results
}

/**
 * Get recent psychotest results
 */
export async function getRecentResults(count: number = 10): Promise<PsychotestResult[]> {
  const db = getFirebaseFirestore()
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('uploadedAt', 'desc'),
    limit(count)
  )
  const querySnapshot = await getDocs(q)

  const results: PsychotestResult[] = []
  querySnapshot.forEach((docSnap) => {
    results.push({ id: docSnap.id, ...docSnap.data() } as PsychotestResult)
  })

  return results
}

/**
 * Get total results count
 */
export async function getResultsCount(): Promise<number> {
  const db = getFirebaseFirestore()
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
  return querySnapshot.size
}

/**
 * Increment download count and update last downloaded timestamp
 */
export async function recordDownload(resultId: string): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, resultId)

  await updateDoc(docRef, {
    downloadCount: increment(1),
    lastDownloadedAt: serverTimestamp(),
  })
}

/**
 * Get total download count across all results
 */
export async function getTotalDownloadCount(): Promise<number> {
  const db = getFirebaseFirestore()
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))

  let totalDownloads = 0
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data()
    totalDownloads += data.downloadCount || 0
  })

  return totalDownloads
}

/**
 * Delete a psychotest result (including file from storage)
 */
export async function deletePsychotestResult(id: string): Promise<void> {
  const db = getFirebaseFirestore()
  const storage = getFirebaseStorage()

  // Get the result to find the file path
  const result = await getPsychotestResultById(id)
  if (!result) {
    throw new Error('Result not found')
  }

  // Delete file from storage
  const fileRef = ref(storage, result.filePath)
  try {
    await deleteObject(fileRef)
  } catch (error) {
    console.warn('Failed to delete file from storage:', error)
    // Continue with deleting the document even if file deletion fails
  }

  // Delete Firestore document
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

/**
 * Search results by entity name or token
 */
export async function searchResults(
  searchQuery: string,
  entityType?: EntityType,
  maxResults: number = 10
): Promise<PsychotestResult[]> {
  const db = getFirebaseFirestore()
  const searchLower = searchQuery.toLowerCase()

  let q
  if (entityType) {
    q = query(
      collection(db, COLLECTION_NAME),
      where('entityType', '==', entityType),
      orderBy('uploadedAt', 'desc'),
      limit(100)
    )
  } else {
    q = query(
      collection(db, COLLECTION_NAME),
      orderBy('uploadedAt', 'desc'),
      limit(100)
    )
  }

  const querySnapshot = await getDocs(q)

  const results: PsychotestResult[] = []
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data() as PsychotestResult
    const searchFields = [
      data.entityName?.toLowerCase(),
      data.token?.toLowerCase(),
    ]

    if (searchFields.some(field => field?.includes(searchLower))) {
      results.push({ id: docSnap.id, ...data })
    }
  })

  return results.slice(0, maxResults)
}

/**
 * Get results for a specific participant by their ID
 */
export async function getResultsByParticipant(participantId: string): Promise<PsychotestResult[]> {
  return getResultsByEntity('cpmi', participantId)
}

/**
 * Get results for a specific institution by their ID
 */
export async function getResultsByInstitution(institutionId: string): Promise<PsychotestResult[]> {
  return getResultsByEntity('instansi', institutionId)
}

/**
 * Download a result file - returns the download URL and increments download count
 */
export async function downloadResult(resultId: string): Promise<string> {
  const result = await getPsychotestResultById(resultId)
  if (!result) {
    throw new Error('Hasil tidak ditemukan')
  }

  // Increment download count
  await recordDownload(resultId)

  // Return the file URL
  return result.fileURL
}
