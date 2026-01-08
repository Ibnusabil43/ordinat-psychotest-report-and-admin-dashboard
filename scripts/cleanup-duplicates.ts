// Script to list and clean duplicate participants
// Run with: npx tsx scripts/cleanup-duplicates.ts

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

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

async function cleanupDuplicates() {
  try {
    // Login as admin
    console.log('Logging in as admin...')
    await signInWithEmailAndPassword(auth, 'admin@ordinat.id', 'Admin123!')
    
    console.log('\nFetching all participants...')
    const querySnapshot = await getDocs(collection(db, 'participants'))
    
    const participants: Array<{ id: string; nama: string; token: string }> = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      participants.push({
        id: doc.id,
        nama: data.namaLengkap,
        token: data.token
      })
    })
    
    console.log(`\nFound ${participants.length} participants:\n`)
    participants.forEach((p, i) => {
      console.log(`${i + 1}. ID: ${p.id}`)
      console.log(`   Name: ${p.nama}`)
      console.log(`   Token: ${p.token}\n`)
    })
    
    // Find duplicates by name
    const nameCount = new Map<string, typeof participants>()
    participants.forEach(p => {
      const existing = nameCount.get(p.nama.toLowerCase()) || []
      existing.push(p)
      nameCount.set(p.nama.toLowerCase(), existing)
    })
    
    // Delete duplicates (keep the first one)
    for (const [name, items] of nameCount) {
      if (items.length > 1) {
        console.log(`\nFound ${items.length} participants with name "${name}"`)
        console.log(`Keeping: ${items[0].token} (ID: ${items[0].id})`)
        
        for (let i = 1; i < items.length; i++) {
          console.log(`Deleting: ${items[i].token} (ID: ${items[i].id})`)
          await deleteDoc(doc(db, 'participants', items[i].id))
        }
      }
    }
    
    console.log('\n✅ Cleanup complete!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

cleanupDuplicates()
