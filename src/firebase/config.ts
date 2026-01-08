// Firebase configuration
// All values should be set via environment variables for security
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate that all required environment variables are set
export function validateFirebaseConfig(): boolean {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ] as const

  const missingKeys = requiredKeys.filter(
    (key) => !firebaseConfig[key]
  )

  if (missingKeys.length > 0) {
    console.error(
      `Missing Firebase configuration keys: ${missingKeys.join(', ')}. ` +
      'Please check your .env file.'
    )
    return false
  }

  return true
}
