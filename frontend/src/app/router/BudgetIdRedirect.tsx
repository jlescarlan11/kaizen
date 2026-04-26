import { Navigate, useParams } from 'react-router-dom'

/** Preserves the :id param when redirecting /budget/:id → /budgets/:id */
export function BudgetIdRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/budgets/${id}`} replace />
}
