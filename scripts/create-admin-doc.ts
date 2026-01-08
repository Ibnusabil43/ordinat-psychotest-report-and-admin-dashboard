// Script to create admin user document in Firestore
// Run with: npx tsx scripts/create-admin-doc.ts

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'

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

async function createAdminDoc() {
  const email = 'admin@ordinat.id'
  const password = 'Admin123!'
  const displayName = 'Admin Ordinat'

  try {
    console.log('Signing in...')
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    console.log('Checking if user document exists...')
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (userDoc.exists()) {
      console.log('✅ User document already exists!')
    } else {
      console.log('Creating user document in Firestore...')
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
      console.log('✅ User document created!')
    }

    console.log('─'.repeat(40))
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 Name:', displayName)
    console.log('🛡️  Role: admin')
    console.log('🆔 UID:', user.uid)
    console.log('─'.repeat(40))
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createAdminDoc()
