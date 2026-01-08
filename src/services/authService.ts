// Firebase Authentication Service
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseFirestore } from '@/firebase'
import type { User, UserRole, UserSettings } from '@/types/models'

const DEFAULT_USER_SETTINGS: UserSettings = {
  emailNotifications: true,
  uploadNotifications: true,
  registrationNotifications: false,
}

/**
 * Sign in with email and password
 */
export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<{ user: FirebaseUser; userData: User }> {
  const auth = getFirebaseAuth()
  const db = getFirebaseFirestore()

  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const firebaseUser = userCredential.user

  // Get user data from Firestore with timeout
  const userDocRef = doc(db, 'users', firebaseUser.uid)
  
  try {
    const userDocSnap = await Promise.race([
      getDoc(userDocRef),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore read timeout')), 10000)
      )
    ]) as any

    if (!userDocSnap.exists()) {
      throw new Error('User profile not found. Please contact administrator.')
    }

    const userData = { id: userDocSnap.id, ...userDocSnap.data() } as User

    // Update last login timestamp (fire and forget, don't wait)
    updateDoc(userDocRef, {
      lastLoginAt: serverTimestamp(),
    }).catch(err => console.warn('Failed to update lastLoginAt:', err))

    return { user: firebaseUser, userData }
  } catch (err: any) {
    console.error('Firestore read error:', err)
    throw new Error('Cannot connect to database. Please check your Firestore rules are deployed.')
  }
}

/**
 * Sign out the current user
 */
export async function logout(): Promise<void> {
  const auth = getFirebaseAuth()
  await signOut(auth)
}

/**
 * Subscribe to auth state changes
 */
export function observeAuthState(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  const auth = getFirebaseAuth()
  return auth.currentUser
}

/**
 * Get user data from Firestore by user ID
 */
export async function getUserData(userId: string): Promise<User | null> {
  const db = getFirebaseFirestore()
  const userDocRef = doc(db, 'users', userId)
  const userDocSnap = await getDoc(userDocRef)

  if (!userDocSnap.exists()) {
    return null
  }

  return { id: userDocSnap.id, ...userDocSnap.data() } as User
}

/**
 * Create a new user (admin function)
 * Note: In production, this should be done via Cloud Functions for security
 */
export async function createUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<User> {
  const auth = getFirebaseAuth()
  const db = getFirebaseFirestore()

  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const firebaseUser = userCredential.user

  // Update display name in Firebase Auth
  await updateProfile(firebaseUser, { displayName })

  // Create user document in Firestore
  const userData: Omit<User, 'id'> = {
    email,
    displayName,
    role,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    isActive: true,
    settings: DEFAULT_USER_SETTINGS,
  }

  await setDoc(doc(db, 'users', firebaseUser.uid), userData)

  return { id: firebaseUser.uid, ...userData } as User
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, 'displayName' | 'phone' | 'photoURL'>>
): Promise<void> {
  const db = getFirebaseFirestore()
  const auth = getFirebaseAuth()

  const userDocRef = doc(db, 'users', userId)
  await updateDoc(userDocRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })

  // Also update Firebase Auth profile if displayName changed
  if (data.displayName && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: data.displayName })
  }
}

/**
 * Update user notification settings
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings> & { phone?: string }
): Promise<void> {
  const db = getFirebaseFirestore()
  const userDocRef = doc(db, 'users', userId)

  const updateData: Record<string, any> = {
    updatedAt: serverTimestamp(),
  }
  
  if (settings.emailNotifications !== undefined) {
    updateData['settings.emailNotifications'] = settings.emailNotifications
  }
  if (settings.uploadNotifications !== undefined) {
    updateData['settings.uploadNotifications'] = settings.uploadNotifications
  }
  if (settings.registrationNotifications !== undefined) {
    updateData['settings.registrationNotifications'] = settings.registrationNotifications
  }
  if (settings.phone !== undefined) {
    updateData['phone'] = settings.phone
  }

  await updateDoc(userDocRef, updateData)
}

/**
 * Get user settings from Firestore
 */
export async function getUserSettings(userId: string): Promise<(UserSettings & { phone?: string }) | null> {
  const userData = await getUserData(userId)
  if (!userData) return null
  
  return {
    ...(userData.settings || DEFAULT_USER_SETTINGS),
    phone: userData.phone,
  }
}

/**
 * Change user password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const auth = getFirebaseAuth()
  const user = auth.currentUser

  if (!user || !user.email) {
    throw new Error('No authenticated user found')
  }

  // Re-authenticate user before changing password
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)

  // Update password
  await updatePassword(user, newPassword)
}

/**
 * Check if a user has a specific role
 */
export async function checkUserRole(
  userId: string,
  requiredRole: UserRole
): Promise<boolean> {
  const userData = await getUserData(userId)
  return userData?.role === requiredRole
}
