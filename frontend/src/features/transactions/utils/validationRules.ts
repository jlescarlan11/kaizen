import type { TransactionRequest } from '../../../app/store/api/transactionApi'

export const ErrorCode = {
  REQUIRED: 'REQUIRED',
  AMOUNT_POSITIVE: 'AMOUNT_POSITIVE',
  AMOUNT_MAX_DECIMALS: 'AMOUNT_MAX_DECIMALS',
  FUTURE_DATE_REJECT: 'FUTURE_DATE_REJECT',
  TYPE_INVALID: 'TYPE_INVALID',
  RECURRING_MULTIPLIER_POSITIVE: 'RECURRING_MULTIPLIER_POSITIVE',
  RECURRING_UNIT_REQUIRED: 'RECURRING_UNIT_REQUIRED',
} as const

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

export interface ValidationError {
  field: keyof TransactionRequest | 'form'
  code: ErrorCodeType
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export function validateTransaction(transaction: Partial<TransactionRequest>): ValidationResult {
  const errors: ValidationError[] = []

  // Required checks
  if (transaction.amount === undefined || transaction.amount === null) {
    errors.push({ field: 'amount', code: ErrorCode.REQUIRED })
  }
  if (!transaction.type) {
    errors.push({ field: 'type', code: ErrorCode.REQUIRED })
  }

  // Type-specific required checks (e.g., recurring)
  if (transaction.isRecurring) {
    if (!transaction.frequencyUnit) {
      errors.push({ field: 'frequencyUnit', code: ErrorCode.RECURRING_UNIT_REQUIRED })
    }
    if (transaction.frequencyMultiplier === undefined || transaction.frequencyMultiplier === null) {
      errors.push({ field: 'frequencyMultiplier', code: ErrorCode.REQUIRED })
    }
  }

  // Range and Format checks (only run if field exists)
  if (transaction.amount !== undefined && transaction.amount !== null) {
    if (transaction.amount <= 0) {
      errors.push({ field: 'amount', code: ErrorCode.AMOUNT_POSITIVE })
    }
    const decimals = transaction.amount.toString().split('.')[1]
    if (decimals && decimals.length > 2) {
      errors.push({ field: 'amount', code: ErrorCode.AMOUNT_MAX_DECIMALS })
    }
  }

  if (transaction.transactionDate) {
    const today = new Date().toISOString().split('T')[0]
    const transactionDay = transaction.transactionDate.split('T')[0]
    if (transactionDay > today) {
      errors.push({ field: 'transactionDate', code: ErrorCode.FUTURE_DATE_REJECT })
    }
  }

  if (transaction.type && !['INCOME', 'EXPENSE', 'RECONCILIATION'].includes(transaction.type)) {
    errors.push({ field: 'type', code: ErrorCode.TYPE_INVALID })
  }

  if (
    transaction.isRecurring &&
    transaction.frequencyMultiplier !== undefined &&
    transaction.frequencyMultiplier !== null
  ) {
    if (transaction.frequencyMultiplier <= 0) {
      errors.push({ field: 'frequencyMultiplier', code: ErrorCode.RECURRING_MULTIPLIER_POSITIVE })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
