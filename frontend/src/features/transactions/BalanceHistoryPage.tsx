import { type ReactElement } from 'react'
import { useGetBalanceHistoryQuery } from '../../app/store/api/transactionApi'
import { pageLayout } from '../../shared/styles/layout'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { ChevronLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../shared/lib/cn'

import { formatCurrency } from '../../shared/lib/formatCurrency'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function BalanceHistoryPage(): ReactElement {
  const navigate = useNavigate()
  const { data, isLoading } = useGetBalanceHistoryQuery()
  const history = data?.history ?? []

  return (
    <div className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Balance History
            </h1>
            <p className="text-muted-foreground">
              Chronological record of your account balance changes.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl w-full">
        {isLoading ? (
          <Card className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </Card>
        ) : history.length === 0 ? (
          <Card className="p-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-ui-surface-muted flex items-center justify-center mb-4">
              <RefreshCw className="h-6 w-6 text-subtle-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No history yet</h3>
            <p className="text-sm text-subtle-foreground">
              Your balance history will appear here as you add transactions.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <Card
                key={`${entry.transactionId}-${index}`}
                className="flex items-center justify-between p-4 hover:border-ui-border-strong transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center',
                      entry.transactionType === 'INCOME'
                        ? 'bg-ui-success/10 text-ui-success'
                        : entry.transactionType === 'EXPENSE'
                          ? 'bg-ui-error/10 text-ui-error'
                          : 'bg-ui-warning/10 text-ui-warning',
                    )}
                  >
                    {entry.transactionType === 'INCOME' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {entry.eventDescription ||
                        (entry.transactionType === 'INCOME' ? 'Income' : 'Expense')}
                    </p>
                    <p className="text-xs text-subtle-foreground">
                      {dateFormatter.format(new Date(entry.date))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-lg font-bold tracking-tight',
                      entry.balance >= 0 ? 'text-foreground' : 'text-ui-error',
                    )}
                  >
                    {currencyFormatter.format(entry.balance)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Balance
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
