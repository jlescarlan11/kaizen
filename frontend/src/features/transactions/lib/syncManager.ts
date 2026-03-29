import { db, SyncStatus } from './localStore'
import { transactionApi } from '../../../app/store/api/transactionApi'
import { store } from '../../../app/store/store'
import { validationGate } from './validationGate'
import { showAlert } from '../../../app/store/notificationSlice'
import { SystemMessages } from '../utils/errorMessages'

/**
 * Background Sync Manager
 * Monitors network state and syncs pending transactions.
 */
export class SyncManager {
  private static isSyncing = false

  /**
   * Initializes the sync manager.
   */
  static init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Connectivity restored. Triggering sync...')
        this.syncPending()
      })

      // Also trigger on init in case we started online with pending items
      if (navigator.onLine) {
        this.syncPending()
      }
    }
  }

  /**
   * Syncs all pending transactions to the remote store.
   */
  static async syncPending() {
    if (this.isSyncing) return
    this.isSyncing = true

    let syncFailedCount = 0
    let validationFailedCount = 0

    try {
      const pending = await db.transactions.where('syncStatus').equals(SyncStatus.PENDING).toArray()

      if (pending.length === 0) {
        this.isSyncing = false
        return
      }

      for (const pt of pending) {
        const payload = {
          amount: pt.amount,
          type: pt.type,
          transactionDate: pt.transactionDate,
          description: pt.description,
          categoryId: pt.categoryId,
          paymentMethodId: pt.paymentMethodId,
          notes: pt.notes,
          isRecurring: pt.isRecurring,
          frequencyUnit: pt.frequencyUnit,
          frequencyMultiplier: pt.frequencyMultiplier,
          clientGeneratedId: pt.clientGeneratedId,
          remindersEnabled: pt.remindersEnabled,
          parentRecurringTransactionId: pt.parentRecurringTransactionId,
        }

        // Instruction 3: Sync-Path Validation
        const validationResult = validationGate(payload)
        if (!validationResult.valid) {
          console.error(
            `Validation failed for pending transaction ${pt.clientGeneratedId}:`,
            validationResult.errors,
          )
          validationFailedCount++
          await db.transactions.update(pt.id!, {
            syncStatus: SyncStatus.FAILED,
            updatedAt: new Date().toISOString(),
          })
          continue
        }

        try {
          // Instruction 7: Idempotent remote write using clientGeneratedId
          // We use the dispatch to trigger the mutation
          await store
            .dispatch(transactionApi.endpoints.createTransaction.initiate(payload))
            .unwrap()

          // On success, update local status to SYNCED
          await db.transactions.update(pt.id!, {
            syncStatus: SyncStatus.SYNCED,
            updatedAt: new Date().toISOString(),
          })

          console.log(`Synced transaction ${pt.clientGeneratedId} successfully.`)
        } catch (err) {
          console.error(`Failed to sync transaction ${pt.clientGeneratedId}:`, err)
          syncFailedCount++
          // Instruction 7: Retry on next connectivity event or apply retry strategy
          await db.transactions.update(pt.id!, {
            syncStatus: SyncStatus.FAILED,
            updatedAt: new Date().toISOString(),
          })
        }
      }

      // Show summary alert if there were failures
      if (syncFailedCount > 0 || validationFailedCount > 0) {
        store.dispatch(
          showAlert({
            ...SystemMessages.SYNC_FAILURE,
            message: `${SystemMessages.SYNC_FAILURE.message} (${syncFailedCount + validationFailedCount} items failed)`,
            type: 'error',
            dataSaved: true,
            autoRetry: true,
          }),
        )
      }
    } finally {
      this.isSyncing = false
    }
  }
}
