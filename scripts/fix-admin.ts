// Quick script to add admin user document to Firestore
// Run with: npx tsx scripts/fix-admin.ts

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDfcxLzGOCzEZHgkfMjE4HnsuvDmTPeRwE",
  authDomain: "ordinat-dashboard.firebaseapp.com",
  projectId: "ordinat-dashboard",
  storageBucket: "ordinat-dashboard.firebasestorage.app",
  messagingSenderId: "1033920332896",
  appId: "1:1033920332896:web:12834fa4d7f4bea0012f05",
}

// Replace with the actual UID from Firebase Console > Authentication
const ADMIN_UID = 'oTLowAv6FAQQXviSBObarobuZps2' // From Firebase Console

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function fixAdmin() {
  console.log('Creating admin document with UID:', ADMIN_UID)
  
  try {
    await setDoc(doc(db, 'users', ADMIN_UID), {
      email: 'admin@ordinat.id',
      displayName: 'Admin Ordinat',
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
    }, { merge: true })
    
    console.log('✅ Admin document created successfully!')
    console.log('You can now login at http://localhost:5174/admin/login')
    console.log('Email: admin@ordinat.id')
    console.log('Password: Admin123!')
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

fixAdmin()
