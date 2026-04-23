import { ErrorCode, type ErrorCodeType } from './validationRules'

const ErrorMessages: Record<ErrorCodeType, string> = {
  [ErrorCode.REQUIRED]: 'This field is required.',
  [ErrorCode.AMOUNT_POSITIVE]: 'Amount must be a positive value greater than zero.',
  [ErrorCode.AMOUNT_MAX_DECIMALS]: 'Amount cannot have more than two decimal places.',
  [ErrorCode.FUTURE_DATE_REJECT]: 'Transactions cannot be set in the future.',
  [ErrorCode.TYPE_INVALID]: 'Selected transaction type is invalid.',
  [ErrorCode.DESCRIPTION_TOO_LONG]: 'Description cannot exceed 255 characters.',
  [ErrorCode.DATE_INVALID]: 'Please provide a valid date.',
  [ErrorCode.RECURRING_MULTIPLIER_POSITIVE]: 'Multiplier must be greater than zero.',
  [ErrorCode.RECURRING_UNIT_REQUIRED]: 'Frequency unit is required for recurring transactions.',
}

export function getErrorMessage(code: ErrorCodeType, field?: string): string {
  // We can customize the message based on the field if needed
  if (code === ErrorCode.REQUIRED && field) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`
  }
  return ErrorMessages[code] || 'An unexpected error occurred.'
}

export const SystemMessages = {
  SYNC_FAILURE: {
    title: 'Sync Failed',
    message: 'Some transactions could not be synced. They are preserved locally for retry.',
  },
  NETWORK_TIMEOUT: {
    title: 'Network Timeout',
    message: 'The request timed out. Please check your connection and try again.',
  },
  STORAGE_ERROR: {
    title: 'Storage Error',
    message: 'An error occurred while saving to local storage.',
  },
  OFFLINE_SAVE: {
    title: 'Saved Locally',
    message: 'Transaction saved to your device. It will sync when you are back online.',
  },
  SUCCESS: {
    title: 'Success',
    message: 'Transaction saved successfully.',
  },
  OFFLINE_BLOCKED: {
    title: 'Connectivity Required',
    message: 'This action requires an active internet connection.',
  },
}
