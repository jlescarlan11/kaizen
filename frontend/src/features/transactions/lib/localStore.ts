import Dexie, { type Table } from 'dexie'
import type { TransactionRequest } from '../../../app/store/api/transactionApi'

export type SyncStatus = 'pending' | 'synced' | 'failed'

export const SyncStatus = {
  PENDING: 'pending',
  SYNCED: 'synced',
  FAILED: 'failed',
} as const

export interface LocalTransaction extends TransactionRequest {
  id?: number
  clientGeneratedId: string
  syncStatus: SyncStatus
  createdAt: string
  updatedAt: string
}

export class KaizenLocalDatabase extends Dexie {
  transactions!: Table<LocalTransaction>

  constructor() {
    super('KaizenLocalDatabase')
    this.version(1).stores({
      transactions: '++id, clientGeneratedId, syncStatus, transactionDate',
    })
  }
}

export const db = new KaizenLocalDatabase()

/**
 * Generates a collision-resistant UUID v4.
 */
export function generateClientId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  // Fallback for older browsers or non-window environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
