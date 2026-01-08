// Seed script to create initial admin user
// Run with: npx tsx scripts/seed-admin.ts

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

async function seedAdminUser() {
  const email = 'admin@ordinat.id'
  const password = 'Admin123!'
  const displayName = 'Admin Ordinat'

  try {
    console.log('Creating admin user...')
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update display name
    await updateProfile(user, { displayName })
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      role: 'admin',
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

    console.log('✅ Admin user created successfully!')
    console.log('─'.repeat(40))
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 Name:', displayName)
    console.log('🛡️  Role: admin')
    console.log('─'.repeat(40))
    
    process.exit(0)
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin user already exists!')
      console.log('─'.repeat(40))
      console.log('📧 Email:', email)
      console.log('🔑 Password:', password)
      console.log('─'.repeat(40))
    } else {
      console.error('❌ Error creating admin user:', error.message)
    }
    process.exit(1)
  }
}

seedAdminUser()
