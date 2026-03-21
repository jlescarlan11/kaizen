import { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { BalanceEditor } from './BalanceEditor'

export function BalanceEditPage(): ReactElement | null {
  const { user } = useAuthState()
  const navigate = useNavigate()

  const handleClose = () => {
    navigate(-1)
  }

  if (!user) {
    return null
  }

  return <BalanceEditor currentBalance={user.openingBalance} onClose={handleClose} open />
}
