// Dashboard Statistics Service
import { getParticipantCount } from './participantService'
import { getInstitutionCount } from './institutionService'
import { getResultsCount, getTotalDownloadCount } from './resultsService'
import type { DashboardStats } from '@/types/models'
import { Timestamp } from 'firebase/firestore'

export interface DashboardStatsDisplay {
  totalPeserta: string
  totalFiles: string
  totalDownloads: string
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [participantCount, institutionCount, resultsCount, downloadCount] = await Promise.all([
    getParticipantCount(),
    getInstitutionCount(),
    getResultsCount(),
    getTotalDownloadCount(),
  ])

  return {
    totalPeserta: participantCount + institutionCount,
    totalFiles: resultsCount,
    totalDownloads: downloadCount,
    lastUpdated: Timestamp.now(),
  }
}

/**
 * Format number with thousand separators
 */
function formatNumber(num: number): string {
  return num.toLocaleString('id-ID')
}

/**
 * Get dashboard statistics formatted for display
 */
export async function getDashboardStatsDisplay(): Promise<DashboardStatsDisplay> {
  const stats = await getDashboardStats()

  return {
    totalPeserta: formatNumber(stats.totalPeserta),
    totalFiles: formatNumber(stats.totalFiles),
    totalDownloads: formatNumber(stats.totalDownloads),
  }
}
