// All user-visible copy for onboarding errors lives here until the copy owner/location is confirmed (PRD Open Question 8).
export const NETWORK_ERROR_TITLE = 'Connection interrupted'
export const NETWORK_ERROR_DESCRIPTION =
  "We couldn't reach our servers. Check your connection and try again."
export const NETWORK_ERROR_ACTION = 'Retry now'

export const VALIDATION_ERROR_TITLE = 'We need a fix'
export const VALIDATION_ERROR_DESCRIPTION =
  'Some inputs did not pass validation. Review the highlighted fields and submit again.'
export const VALIDATION_ERROR_ACTION = 'Check inputs'

export const SERVER_ERROR_TITLE = 'Something went wrong'
export const SERVER_ERROR_DESCRIPTION =
  'Our servers had trouble saving your data. Wait a moment and try again.'
export const SERVER_ERROR_ACTION = 'Try again'

// Placeholder support copy rendered once the retry cap is reached (PRD Open Question 7).
export const RETRY_CAP_SUPPORT_TEXT = 'Still stuck? Contact support or try again later.'

// Describes fallback text for unknown errors to avoid exposing backend payloads.
export const UNKNOWN_ERROR_TITLE = 'Unexpected issue'
export const UNKNOWN_ERROR_DESCRIPTION =
  'An unexpected error occurred. Please retry or reach out to support.'
export const UNKNOWN_ERROR_ACTION = 'Retry'
