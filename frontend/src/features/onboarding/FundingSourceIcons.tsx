import { Banknote, Landmark, Smartphone } from 'lucide-react'
import type { FundingSourceType } from './fundingSource'
import type { ReactNode } from 'react'

export const FUNDING_SOURCE_ICONS: Record<FundingSourceType, ReactNode> = {
  CASH_ON_HAND: <Banknote size={18} strokeWidth={2.25} />,
  BANK_ACCOUNT: <Landmark size={18} strokeWidth={2.25} />,
  E_WALLET: <Smartphone size={18} strokeWidth={2.25} />,
}
