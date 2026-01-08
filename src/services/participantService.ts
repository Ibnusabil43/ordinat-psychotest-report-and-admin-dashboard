// Participant Service - Firestore operations for CPMI participants
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
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/firebase'
import type { Participant, ParticipantFormData } from '@/types/models'

const COLLECTION_NAME = 'participants'

/**
 * Generate a unique token for participants
 */
export function generateParticipantToken(): string {
  const year = new Date().getFullYear()
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CPM-${year}-${randomPart}`
}

/**
 * Create a new participant
 */
export async function createParticipant(
  data: ParticipantFormData,
  createdBy: string
): Promise<Participant> {
  const db = getFirebaseFirestore()

  // Parse tempatTanggalLahir into separate fields
  const [tempatLahir, tanggalLahirStr] = data.tempatTanggalLahir.split(',').map(s => s.trim())

  const participantData: Omit<Participant, 'id'> = {
    namaLengkap: data.namaLengkap,
    tempatLahir: tempatLahir || '',
    tanggalLahir: Timestamp.fromDate(new Date(tanggalLahirStr || Date.now())),
    pendidikan: data.pendidikan,
    nikOrPaspor: data.nik,
    token: data.token || generateParticipantToken(),
    type: 'cpmi',
    createdAt: serverTimestamp() as unknown as Timestamp,
    updatedAt: serverTimestamp() as unknown as Timestamp,
    createdBy,
    hasResult: false,
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), participantData)
  return { id: docRef.id, ...participantData }
}

/**
 * Get a participant by ID
 */
export async function getParticipantById(id: string): Promise<Participant | null> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return { id: docSnap.id, ...docSnap.data() } as Participant
}

/**
 * Get a participant by token
 */
export async function getParticipantByToken(token: string): Promise<Participant | null> {
  const db = getFirebaseFirestore()
  const q = query(
    collection(db, COLLECTION_NAME),
    where('token', '==', token),
    limit(1)
  )
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty || !querySnapshot.docs[0]) {
    return null
  }

  const docSnap = querySnapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as Participant
}

/**
 * Search participants by name, NIK, or token
 */
export async function searchParticipants(
  searchQuery: string,
  maxResults: number = 10
): Promise<Participant[]> {
  const db = getFirebaseFirestore()
  const searchLower = searchQuery.toLowerCase()

  // Get all participants and filter client-side
  // Note: For production, consider using Algolia or similar for full-text search
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  const querySnapshot = await getDocs(q)

  const results: Participant[] = []
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data() as Participant
    const searchFields = [
      data.namaLengkap?.toLowerCase(),
      data.nikOrPaspor?.toLowerCase(),
      data.token?.toLowerCase(),
    ]

    if (searchFields.some(field => field?.includes(searchLower))) {
      results.push({ id: docSnap.id, ...data })
    }
  })

  return results.slice(0, maxResults)
}

/**
 * Get recent participants
 */
export async function getRecentParticipants(count: number = 5): Promise<Participant[]> {
  const db = getFirebaseFirestore()
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc'),
    limit(count)
  )
  const querySnapshot = await getDocs(q)

  const participants: Participant[] = []
  querySnapshot.forEach((docSnap) => {
    participants.push({ id: docSnap.id, ...docSnap.data() } as Participant)
  })

  return participants
}

/**
 * Get all participants
 */
export async function getAllParticipants(): Promise<Participant[]> {
  const db = getFirebaseFirestore()
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  )
  const querySnapshot = await getDocs(q)

  const participants: Participant[] = []
  querySnapshot.forEach((docSnap) => {
    participants.push({ id: docSnap.id, ...docSnap.data() } as Participant)
  })

  return participants
}

/**
 * Update a participant
 */
export async function updateParticipant(
  id: string,
  data: Partial<Participant>
): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, id)

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a participant
 */
export async function deleteParticipant(id: string): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

/**
 * Get total participant count
 */
export async function getParticipantCount(): Promise<number> {
  const db = getFirebaseFirestore()
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
  return querySnapshot.size
}

/**
 * Mark participant as having a result
 */
export async function markParticipantHasResult(
  participantId: string,
  resultId: string
): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, participantId)

  await updateDoc(docRef, {
    hasResult: true,
    resultId,
    updatedAt: serverTimestamp(),
  })
}
