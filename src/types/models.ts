// Firestore Data Models & Types
// These types define the structure of documents in our Firestore collections

import type { Timestamp } from 'firebase/firestore'

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'tester'

/**
 * Registration/entity types
 */
export type EntityType = 'cpmi' | 'instansi'

/**
 * Activity status types
 */
export type ActivityStatus = 'registrasi' | 'upload_berhasil' | 'unduhan'

/**
 * User document structure
 * Collection: users/{userId}
 */
export interface User {
  id?: string
  email: string
  displayName: string
  role: UserRole
  phone?: string
  photoURL?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt?: Timestamp
  isActive: boolean
  settings: UserSettings
}

/**
 * User notification settings
 */
export interface UserSettings {
  emailNotifications: boolean
  uploadNotifications: boolean
  registrationNotifications: boolean
}

/**
 * Participant (CPMI) document structure
 * Collection: participants/{participantId}
 */
export interface Participant {
  id?: string
  namaLengkap: string
  tempatLahir: string
  tanggalLahir: Timestamp
  pendidikan: string
  nikOrPaspor: string
  token: string
  type: 'cpmi'
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // userId of admin who created
  hasResult: boolean
  resultId?: string // Reference to psychotest result
}

/**
 * Institution (Instansi) document structure
 * Collection: institutions/{institutionId}
 */
export interface Institution {
  id?: string
  namaInstansi: string
  token: string
  type: 'instansi'
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // userId of admin who created
  participantCount: number
}

/**
 * Psychotest Result document structure
 * Collection: psychotestResults/{resultId}
 */
export interface PsychotestResult {
  id?: string
  entityType: EntityType
  entityId: string // participantId or institutionId
  entityName: string
  token: string
  jenisTest: string
  tanggalTest: Timestamp
  fileURL: string
  fileName: string
  fileSize: number
  filePath: string // Storage path for deletion
  uploadedAt: Timestamp
  uploadedBy: string // userId of admin who uploaded
  downloadCount: number
  lastDownloadedAt?: Timestamp
}

/**
 * Activity Log document structure
 * Collection: activityLogs/{logId}
 */
export interface ActivityLog {
  id?: string
  tanggal: Timestamp
  nama: string
  tipe: EntityType
  token: string
  status: ActivityStatus
  userId?: string // User who performed the action
  entityId?: string // Related entity ID
  metadata?: Record<string, unknown>
}

/**
 * Dashboard Statistics (computed/aggregated)
 * Collection: stats/dashboard
 */
export interface DashboardStats {
  totalPeserta: number
  totalFiles: number
  totalDownloads: number
  lastUpdated: Timestamp
}

/**
 * Form data types for UI components
 */
export interface ParticipantFormData {
  namaLengkap: string
  tempatTanggalLahir: string
  pendidikan: string
  nik: string
  token: string
}

export interface InstitutionFormData {
  namaInstansi: string
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
  role: UserRole
}

export interface ProfileFormData {
  namaLengkap: string
  email: string
  phone: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Search result types for Tester Portal
 */
export interface SearchResult {
  id: string
  timestamp: string
  name: string
  class: string
  status: 'found' | 'not-found'
}

/**
 * File download entry for institution portal
 */
export interface DownloadEntry {
  id: string
  nama: string
  tanggal: string
  fileURL: string
}
