export type FundingSourceType = 'CASH_ON_HAND' | 'BANK_ACCOUNT' | 'E_WALLET'

export const FUNDING_SOURCE_OPTIONS: { value: FundingSourceType; label: string }[] = [
  { value: 'CASH_ON_HAND', label: 'Cash on hand' },
  { value: 'BANK_ACCOUNT', label: 'Bank account' },
  { value: 'E_WALLET', label: 'E-wallet' },
]

export const FUNDING_SOURCE_HELP_TEXT: Record<FundingSourceType, string> = {
  CASH_ON_HAND: 'Use this when the money is physically available to spend.',
  BANK_ACCOUNT: 'Use this for checking, savings, or other bank-held balances.',
  E_WALLET: 'Use this for GCash, Maya, or similar digital wallet balances.',
}
