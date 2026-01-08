// Script to create test participant
// Run with: npx tsx scripts/create-test-participant.ts

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

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

async function createTestParticipant() {
  try {
    // Login as admin first
    console.log('Logging in as admin...')
    const userCred = await signInWithEmailAndPassword(auth, 'admin@ordinat.id', 'Admin123!')
    
    console.log('Creating test participant...')
    
    const participantData = {
      namaLengkap: 'CASIDIN',
      tempatLahir: 'Jakarta',
      tanggalLahir: Timestamp.fromDate(new Date('1990-01-01')),
      pendidikan: 'SMA',
      nikOrPaspor: '1234567890123456',
      token: 'CPM-2026-O9ABBS',
      type: 'cpmi',
      createdAt: Timestamp.now(),
      createdBy: userCred.user.uid,
      hasResult: false
    }
    
    const docRef = await addDoc(collection(db, 'participants'), participantData)
    
    console.log('✅ Test participant created successfully!')
    console.log('─'.repeat(40))
    console.log('📋 Name:', participantData.namaLengkap)
    console.log('🎫 Token:', participantData.token)
    console.log('🆔 ID:', docRef.id)
    console.log('─'.repeat(40))
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createTestParticipant()
