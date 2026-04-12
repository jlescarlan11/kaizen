/**
 * Size of the buffer to render outside the viewport in the virtualized list.
 */
export const TRANSACTION_OVERSCAN_BUFFER = 5

/**
 * Number of transactions to fetch per page.
 */
export const TRANSACTION_PAGE_SIZE = 25

/**
 * Performance target for the transaction list load time.
 */
export const PERFORMANCE_LOAD_TIME_THRESHOLD_MS = 2000

/**
 * Performance target for the record count at which the load time threshold must be met.
 */
export const PERFORMANCE_RECORD_COUNT_TARGET = 1000
