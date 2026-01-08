# Firebase Backend Integration Guide

This document describes the Firebase backend integration for the Ordinat Cakrawala Dashboard.

## Table of Contents
1. [Overview](#overview)
2. [Project Setup](#project-setup)
3. [Firebase Services](#firebase-services)
4. [Data Models](#data-models)
5. [Authentication](#authentication)
6. [Security Rules](#security-rules)
7. [Service Functions](#service-functions)
8. [Environment Variables](#environment-variables)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)

---

## Overview

The dashboard uses Firebase for:
- **Authentication**: Email/password login for admins and testers
- **Firestore**: Database for users, participants, institutions, results, and activity logs
- **Storage**: PDF file storage for psychotest results

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vue 3 Frontend                          │
├─────────────────────────────────────────────────────────────────┤
│  Views          │  Components     │  Composables  │  Stores     │
│  - AdminLogin   │  - AdminSidebar │  - useMobile  │  - auth.ts  │
│  - Dashboard    │  - UI Components│               │             │
│  - Upload       │                 │               │             │
│  - Registration │                 │               │             │
│  - Settings     │                 │               │             │
│  - TesterPortal │                 │               │             │
│  - UserLanding  │                 │               │             │
├─────────────────┴─────────────────┴───────────────┴─────────────┤
│                        Services Layer                           │
│  authService │ participantService │ institutionService          │
│  resultsService │ activityService │ statsService                │
├─────────────────────────────────────────────────────────────────┤
│                      Firebase SDK                                │
│        Auth          │      Firestore      │     Storage         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable the following services:
   - **Authentication** → Enable Email/Password provider
   - **Cloud Firestore** → Start in production mode
   - **Storage** → Create default bucket

### 2. Configure Firebase in Project

Create `.env` file in project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (select Firestore and Storage)
firebase init

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

---

## Firebase Services

### Configuration (`src/firebase/`)

- **config.ts**: Firebase configuration from environment variables
- **index.ts**: Firebase app initialization and service getters

```typescript
// Usage
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/firebase'

const auth = getFirebaseAuth()
const db = getFirebaseFirestore()
const storage = getFirebaseStorage()
```

---

## Data Models

### Collections

| Collection | Description |
|------------|-------------|
| `users` | Admin and tester accounts |
| `participants` | CPMI (migrant worker candidates) data |
| `institutions` | Schools, companies, organizations |
| `psychotestResults` | Uploaded PDF results with metadata |
| `activityLogs` | Audit trail of all actions |

### User Document
```typescript
interface User {
  id?: string
  email: string
  displayName: string
  role: 'admin' | 'tester'
  phone?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt?: Timestamp
  isActive: boolean
  settings: {
    emailNotifications: boolean
    uploadNotifications: boolean
    registrationNotifications: boolean
  }
}
```

### Participant Document
```typescript
interface Participant {
  id?: string
  namaLengkap: string
  tempatLahir: string
  tanggalLahir: Timestamp
  pendidikan: string
  nikOrPaspor: string
  token: string                  // Unique token for result access
  type: 'cpmi'
  createdAt: Timestamp
  createdBy: string             // Admin user ID
  hasResult: boolean
  resultId?: string
}
```

### Institution Document
```typescript
interface Institution {
  id?: string
  namaInstansi: string
  token: string                  // Unique token for result access
  type: 'instansi'
  createdAt: Timestamp
  createdBy: string
  participantCount: number
}
```

### Psychotest Result Document
```typescript
interface PsychotestResult {
  id?: string
  entityType: 'cpmi' | 'instansi'
  entityId: string
  entityName: string
  token: string
  jenisTest: string
  tanggalTest: Timestamp
  fileURL: string               // Storage download URL
  fileName: string
  fileSize: number
  filePath: string              // Storage path for deletion
  uploadedAt: Timestamp
  uploadedBy: string
  downloadCount: number
  lastDownloadedAt?: Timestamp
}
```

---

## Authentication

### Login Flow

1. User enters email/password on AdminLogin page
2. `authService.loginWithEmailPassword()` is called
3. Firebase Auth validates credentials
4. User document is fetched from Firestore for role information
5. Auth store is updated with user data
6. Router navigates based on role (admin → dashboard, tester → portal)

### Session Persistence

Firebase Auth automatically persists sessions in local storage. On app load:
1. `App.vue` calls `authStore.initializeAuth()`
2. Firebase Auth state listener checks for existing session
3. If found, user data is loaded from Firestore
4. Router guards allow/deny access based on auth state

### Protected Routes

```typescript
// Route meta configuration
{
  path: '/admin/dashboard',
  meta: { requiresAuth: true, roles: ['admin'] }
}

// Guard checks
- requiresAuth: Must be logged in
- roles: Must have one of the specified roles
- guestOnly: Must NOT be logged in (for login page)
```

---

## Security Rules

### Firestore Rules (`firestore.rules`)

```javascript
// Key principles:
// 1. Users can only read/update their own profile settings
// 2. Only admins can create/modify participants, institutions, results
// 3. Testers have read-only access
// 4. Activity logs are append-only (no update/delete)
// 5. Public read for results (token verification in app)
```

### Storage Rules (`storage.rules`)

```javascript
// Key principles:
// 1. Only admins can upload files
// 2. Only PDF files allowed, max 10MB
// 3. Public read access (token verification in Firestore)
```

---

## Service Functions

### Auth Service (`authService.ts`)

| Function | Description |
|----------|-------------|
| `loginWithEmailPassword` | Sign in with credentials |
| `logout` | Sign out current user |
| `observeAuthState` | Subscribe to auth changes |
| `getUserData` | Get user from Firestore |
| `updateUserProfile` | Update display name, phone |
| `updateUserSettings` | Update notification preferences |
| `changePassword` | Change user password |

### Participant Service (`participantService.ts`)

| Function | Description |
|----------|-------------|
| `createParticipant` | Create new CPMI |
| `getParticipantById` | Get by document ID |
| `getParticipantByToken` | Get by unique token |
| `searchParticipants` | Search by name/NIK |
| `updateParticipant` | Update participant data |
| `deleteParticipant` | Remove participant |
| `generateToken` | Generate unique CPM-XXXX token |

### Institution Service (`institutionService.ts`)

| Function | Description |
|----------|-------------|
| `createInstitution` | Create new institution |
| `getInstitutionByToken` | Get by unique token |
| `searchInstitutions` | Search by name |
| `updateInstitution` | Update institution data |
| `deleteInstitution` | Remove institution |
| `generateToken` | Generate unique INS-XXXX token |

### Results Service (`resultsService.ts`)

| Function | Description |
|----------|-------------|
| `uploadPsychotestResult` | Upload PDF with progress tracking |
| `getPsychotestResultById` | Get result by ID |
| `getResultsByEntity` | Get results for participant/institution |
| `getResultsByToken` | Get results by token |
| `downloadResult` | Get download URL and track count |
| `deletePsychotestResult` | Delete result and file |

### Activity Service (`activityService.ts`)

| Function | Description |
|----------|-------------|
| `createActivityLog` | Log any activity |
| `logRegistration` | Log new registration |
| `logUpload` | Log file upload |
| `logDownload` | Log file download |
| `getRecentActivityLogs` | Get latest activities |

### Stats Service (`statsService.ts`)

| Function | Description |
|----------|-------------|
| `getDashboardStats` | Get aggregated statistics |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Auth domain (project.firebaseapp.com) |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Storage bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |

---

## Development Workflow

### Local Development with Emulators

1. Start Firebase emulators:
```bash
firebase emulators:start
```

2. Update `src/firebase/index.ts` to use emulators (uncomment the connectXXXEmulator lines)

3. Start Vite dev server:
```bash
npm run dev
```

### Creating Test Users

Use Firebase Console or create a seed script:

```typescript
// scripts/seed-admin.ts
import { createUser } from '@/services/authService'

await createUser(
  'admin@example.com',
  'password123',
  'Admin User',
  'admin'
)
```

### Testing Upload Flow

1. Create a participant/institution via the Registration page
2. Copy the generated token
3. Go to Upload page
4. Search by token or name
5. Select the entity and upload a PDF
6. Verify in Firebase Console that document and file were created

---

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
# Initialize hosting (one-time)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

### Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

### Full Deployment

```bash
firebase deploy
```

---

## Troubleshooting

### Common Issues

1. **"Firebase not initialized"**
   - Ensure environment variables are set
   - Check that Firebase app is initialized before using services

2. **"Permission denied"**
   - Check if user is authenticated
   - Verify user role in Firestore
   - Review security rules

3. **"Missing or insufficient permissions"**
   - Deploy latest security rules
   - Check Firestore indexes

4. **Upload fails**
   - Verify file is PDF and under 10MB
   - Check Storage rules are deployed
   - Ensure user has admin role

### Debug Mode

Enable verbose logging in development:

```typescript
// src/firebase/index.ts
import { setLogLevel } from 'firebase/firestore'
setLogLevel('debug')
```

---

## Future Improvements

1. **Cloud Functions**: Move sensitive operations (user creation, token generation) to server-side
2. **Algolia Integration**: Better full-text search for large datasets
3. **Analytics**: Add Firebase Analytics for usage tracking
4. **Push Notifications**: Use FCM for real-time notifications
5. **Backup**: Set up automated Firestore backups
6. **Rate Limiting**: Add Cloud Functions to prevent abuse

---

## License

This project is proprietary. All rights reserved to Ordinat Cakrawala.
