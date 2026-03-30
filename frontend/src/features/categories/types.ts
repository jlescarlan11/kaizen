import { type TransactionType } from '../../app/store/api/transactionApi'

export interface Category {
  id: number
  name: string
  isGlobal: boolean
  icon: string
  color: string
  type: TransactionType
}
