import { validateTransaction, type ValidationResult } from '../utils/validationRules'
import type { TransactionRequest } from '../../../app/store/api/transactionApi'

/**
 * Validation Gate
 * Enforces validation rules before any transaction write.
 */
export function validationGate(payload: Partial<TransactionRequest>): ValidationResult {
  const result = validateTransaction(payload)

  if (!result.valid) {
    console.warn('Transaction validation failed:', result.errors)
  }

  return result
}
