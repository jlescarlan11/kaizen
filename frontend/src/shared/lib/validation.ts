/**
 * Validation rules for financial inputs.
 *
 * TODO: Confirm the maximum allowable balance value with the product author. (PRD Open Question 5)
 */
export const MAX_BALANCE_LIMIT = 999_999_999_999.99 // Placeholder: Requires author confirmation.

/**
 * Validates a balance input string.
 *
 * @param value - The raw string value from the input field.
 * @returns An error message if invalid, or null if valid.
 */
export function validateBalance(value: string): string | null {
  if (!value || value.trim() === '') {
    // PRD Open Question 4: Should an empty input block or default to 0.00?
    // Instruction 5 requires rejection of non-numeric/invalid input.
    // Proposing placeholder copy; requires UX/copy review.
    return 'Balance must be a valid number.'
  }

  const numericValue = parseFloat(value)

  if (isNaN(numericValue)) {
    // Proposing placeholder copy; requires UX/copy review.
    return 'Balance must be a valid number.'
  }

  // PRD Section 5, Story 5, second criterion: Reject negative values.
  // TODO: Confirm with author if negative balances are ever valid before shipping.
  if (numericValue < 0) {
    // Proposing placeholder copy; requires UX/copy review.
    return 'Balance cannot be negative.'
  }

  if (numericValue > MAX_BALANCE_LIMIT) {
    // Proposing placeholder copy; requires UX/copy review.
    return `Balance exceeds the maximum allowable amount of ${MAX_BALANCE_LIMIT.toLocaleString()}.`
  }

  return null
}
