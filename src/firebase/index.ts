// Firebase App Initialization - Modular SDK (v9+)
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { firebaseConfig, validateFirebaseConfig } from './config'

// Initialize Firebase only once
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

export function initializeFirebase(): FirebaseApp {
  if (app) {
    return app
  }

  // Validate configuration before initializing
  if (!validateFirebaseConfig()) {
    throw new Error(
      'Firebase configuration is invalid. Please check your environment variables.'
    )
  }

  app = initializeApp(firebaseConfig)
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = initializeFirebase()
    auth = getAuth(firebaseApp)
  }
  return auth
}

export function getFirebaseFirestore(): Firestore {
  if (!db) {
    const firebaseApp = initializeFirebase()
    db = getFirestore(firebaseApp)
  }
  return db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    const firebaseApp = initializeFirebase()
    storage = getStorage(firebaseApp)
  }
  return storage
}

// Export types for convenience
export type { FirebaseApp, Auth, Firestore, FirebaseStorage }
