// Institution Service - Firestore operations for institutions
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
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/firebase'
import type { Institution, InstitutionFormData } from '@/types/models'

const COLLECTION_NAME = 'institutions'

/**
 * Generate a unique token for institutions
 */
export function generateInstitutionToken(): string {
  const year = new Date().getFullYear()
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `INS-${year}-${randomPart}`
}

/**
 * Create a new institution
 */
export async function createInstitution(
  data: InstitutionFormData,
  createdBy: string
): Promise<Institution> {
  const db = getFirebaseFirestore()

  const institutionData: Omit<Institution, 'id'> = {
    namaInstansi: data.namaInstansi,
    token: data.token || generateInstitutionToken(),
    type: 'instansi',
    createdAt: serverTimestamp() as unknown as Timestamp,
    updatedAt: serverTimestamp() as unknown as Timestamp,
    createdBy,
    participantCount: 0,
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), institutionData)
  return { id: docRef.id, ...institutionData }
}

/**
 * Get an institution by ID
 */
export async function getInstitutionById(id: string): Promise<Institution | null> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return { id: docSnap.id, ...docSnap.data() } as Institution
}

/**
 * Get an institution by token
 */
export async function getInstitutionByToken(token: string): Promise<Institution | null> {
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
  return { id: docSnap.id, ...docSnap.data() } as Institution
}

/**
 * Search institutions by name or token
 */
export async function searchInstitutions(
  searchQuery: string,
  maxResults: number = 10
): Promise<Institution[]> {
  const db = getFirebaseFirestore()
  const searchLower = searchQuery.toLowerCase()

  // Get all institutions and filter client-side (no orderBy to avoid index requirement)
  const q = query(
    collection(db, COLLECTION_NAME),
    limit(100)
  )
  const querySnapshot = await getDocs(q)

  const results: Institution[] = []
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data() as Institution
    const searchFields = [
      data.namaInstansi?.toLowerCase(),
      data.token?.toLowerCase(),
    ]

    if (searchFields.some(field => field?.includes(searchLower))) {
      results.push({ id: docSnap.id, ...data })
    }
  })

  // Sort by createdAt client-side
  results.sort((a, b) => {
    const aTime = a.createdAt?.toMillis() || 0
    const bTime = b.createdAt?.toMillis() || 0
    return bTime - aTime
  })

  return results.slice(0, maxResults)
}

/**
 * Get recent institutions
 */
export async function getRecentInstitutions(count: number = 5): Promise<Institution[]> {
  const db = getFirebaseFirestore()
  const q = query(
    collection(db, COLLECTION_NAME),
    limit(50)
  )
  const querySnapshot = await getDocs(q)

  const institutions: Institution[] = []
  querySnapshot.forEach((docSnap) => {
    institutions.push({ id: docSnap.id, ...docSnap.data() } as Institution)
  })

  // Sort client-side
  institutions.sort((a, b) => {
    const aTime = a.createdAt?.toMillis() || 0
    const bTime = b.createdAt?.toMillis() || 0
    return bTime - aTime
  })

  return institutions.slice(0, count)
}

/**
 * Get all institutions
 */
export async function getAllInstitutions(): Promise<Institution[]> {
  const db = getFirebaseFirestore()
  const q = query(
    collection(db, COLLECTION_NAME)
  )
  const querySnapshot = await getDocs(q)

  const institutions: Institution[] = []
  querySnapshot.forEach((docSnap) => {
    institutions.push({ id: docSnap.id, ...docSnap.data() } as Institution)
  })

  return institutions
}

/**
 * Update an institution
 */
export async function updateInstitution(
  id: string,
  data: Partial<Institution>
): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, id)

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete an institution
 */
export async function deleteInstitution(id: string): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

/**
 * Get total institution count
 */
export async function getInstitutionCount(): Promise<number> {
  const db = getFirebaseFirestore()
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
  return querySnapshot.size
}

/**
 * Increment participant count for an institution
 */
export async function incrementInstitutionParticipantCount(
  institutionId: string
): Promise<void> {
  const db = getFirebaseFirestore()
  const docRef = doc(db, COLLECTION_NAME, institutionId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const currentCount = docSnap.data().participantCount || 0
    await updateDoc(docRef, {
      participantCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    })
  }
}
