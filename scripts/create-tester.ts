// Script to create tester user
// Run with: npx tsx scripts/create-tester.ts

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDfcxLzGOCzEZHgkfMjE4HnsuvDmTPeRwE",
  authDomain: "ordinat-dashboard.firebaseapp.com",
  projectId: "ordinat-dashboard",
  storageBucket: "ordinat-dashboard.firebasestorage.app",
  messagingSenderId: "1033920332896",
  appId: "1:1033920332896:web:12834fa4d7f4bea0012f05",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createTesterUser() {
  const email = 'tester@ordinat.id'
  const password = 'Tester123!'
  const displayName = 'Tester Ordinat'

  try {
    console.log('Creating tester user...')
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update display name
    await updateProfile(user, { displayName })
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      role: 'tester',
      phone: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      isActive: true,
      settings: {
        emailNotifications: true,
        uploadNotifications: true,
        registrationNotifications: true
      }
    })

    console.log('✅ Tester user created successfully!')
    console.log('─'.repeat(40))
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 Name:', displayName)
    console.log('🛡️  Role: tester')
    console.log('🆔 UID:', user.uid)
    console.log('─'.repeat(40))
    
    process.exit(0)
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Tester user already exists!')
      console.log('─'.repeat(40))
      console.log('📧 Email:', email)
      console.log('🔑 Password:', password)
      console.log('─'.repeat(40))
    } else {
      console.error('❌ Error creating tester user:', error.message)
    }
    process.exit(1)
  }
}

createTesterUser()
