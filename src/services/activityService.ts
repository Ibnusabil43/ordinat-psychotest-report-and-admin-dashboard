// Activity Log Service - Firestore operations for activity logging
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/firebase'
import type { ActivityLog, ActivityStatus, EntityType } from '@/types/models'

const COLLECTION_NAME = 'activityLogs'

/**
 * Create a new activity log entry
 */
export async function createActivityLog(
  nama: string,
  tipe: EntityType,
  token: string,
  status: ActivityStatus,
  userId?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<ActivityLog> {
  const db = getFirebaseFirestore()

  const logData: Omit<ActivityLog, 'id'> = {
    tanggal: serverTimestamp() as unknown as Timestamp,
    nama,
    tipe,
    token,
    status,
    userId,
    entityId,
    metadata,
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), logData)
  return { id: docRef.id, ...logData }
}

/**
 * Get recent activity logs
 */
export async function getRecentActivityLogs(count: number = 10): Promise<ActivityLog[]> {
  const db = getFirebaseFirestore()
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('tanggal', 'desc'),
    limit(count)
  )
  const querySnapshot = await getDocs(q)

  const logs: ActivityLog[] = []
  querySnapshot.forEach((docSnap) => {
    logs.push({ id: docSnap.id, ...docSnap.data() } as ActivityLog)
  })

  return logs
}

/**
 * Get all activity logs
 */
export async function getAllActivityLogs(): Promise<ActivityLog[]> {
  const db = getFirebaseFirestore()
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('tanggal', 'desc')
  )
  const querySnapshot = await getDocs(q)

  const logs: ActivityLog[] = []
  querySnapshot.forEach((docSnap) => {
    logs.push({ id: docSnap.id, ...docSnap.data() } as ActivityLog)
  })

  return logs
}

/**
 * Log a registration activity
 */
export async function logRegistration(
  nama: string,
  tipe: EntityType,
  token: string,
  userId?: string,
  entityId?: string
): Promise<ActivityLog> {
  return createActivityLog(nama, tipe, token, 'registrasi', userId, entityId, {
    action: 'registration',
  })
}

/**
 * Log an upload activity
 */
export async function logUpload(
  nama: string,
  tipe: EntityType,
  token: string,
  userId?: string,
  entityId?: string,
  fileName?: string
): Promise<ActivityLog> {
  return createActivityLog(nama, tipe, token, 'upload_berhasil', userId, entityId, {
    action: 'upload',
    fileName,
  })
}

/**
 * Log a download activity
 */
export async function logDownload(
  nama: string,
  tipe: EntityType,
  token: string,
  userId?: string,
  entityId?: string,
  fileName?: string
): Promise<ActivityLog> {
  return createActivityLog(nama, tipe, token, 'unduhan', userId, entityId, {
    action: 'download',
    fileName,
  })
}

/**
 * Get formatted status label
 */
export function getStatusLabel(status: ActivityStatus): string {
  const labels: Record<ActivityStatus, string> = {
    registrasi: 'Registrasi',
    upload_berhasil: 'Upload Berhasil',
    unduhan: 'Unduhan',
  }
  return labels[status] || status
}

/**
 * Get type label (CPMI or Instansi)
 */
export function getTypeLabel(tipe: EntityType): string {
  const labels: Record<EntityType, string> = {
    cpmi: 'CPMI',
    instansi: 'Instansi',
  }
  return labels[tipe] || tipe
}
