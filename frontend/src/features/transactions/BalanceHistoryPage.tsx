import { type ReactElement } from 'react'
import { useGetBalanceHistoryQuery } from '../../app/store/api/transactionApi'
import { pageLayout } from '../../shared/styles/layout'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { PageHeader } from '../../shared/components/PageHeader'
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
      <div className="w-full">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0 shrink-0"
          >
            <SharedIcon type="ui" name="chevron-left" size={16} />
          </Button>
          <PageHeader
            title="Balance History"
            subtitle="Chronological record of your account balance changes."
            className="mb-0 flex-1"
          />
        </div>

        <section aria-label="Balance history entries">
          <div className="w-full">
            {isLoading ? (
              <Card className="p-12 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </Card>
            ) : history.length === 0 ? (
              <Card className="p-12 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                  <SharedIcon type="ui" name="refresh" size={24} className="text-text-secondary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-1">No history yet</h3>
                <p className="text-sm text-text-secondary">
                  Your balance history will appear here as you add transactions.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <Card
                    key={`${entry.transactionId}-${index}`}
                    className="flex items-center justify-between p-4 hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center',
                          entry.transactionType === 'INCOME'
                            ? 'bg-success/10 text-success'
                            : entry.transactionType === 'EXPENSE'
                              ? 'bg-error/10 text-error'
                              : 'bg-warning/10 text-warning',
                        )}
                      >
                        {entry.transactionType === 'INCOME' ? (
                          <SharedIcon type="ui" name="trending-up" size={20} />
                        ) : (
                          <SharedIcon type="ui" name="trending-down" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {entry.eventDescription ||
                            (entry.transactionType === 'INCOME' ? 'Income' : 'Expense')}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {dateFormatter.format(new Date(entry.date))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-lg font-semibold tracking-tight',
                          entry.balance >= 0 ? 'text-text-primary' : 'text-error',
                        )}
                      >
                        {currencyFormatter.format(entry.balance)}
                      </p>
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Balance
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
