import { type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { useGetPaymentMethodSummaryQuery } from '../../app/store/api/paymentMethodApi'
import { pageLayout } from '../../shared/styles/layout'

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

export function PaymentMethodSummaryPage(): ReactElement {
  const { data: summary = [], isLoading, error } = useGetPaymentMethodSummaryQuery()

  const totalExpense = summary.reduce((acc, s) => acc + s.totalAmount, 0)

  return (
    <section className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Payment Summary</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Aggregate spending totals per payment method.
          </p>
        </div>
      </header>

      {error && (
        <Card tone="warning">
          <p className="text-sm text-foreground font-medium">Unable to load summary data.</p>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-ui-surface-muted" />
          ))}
        </div>
      ) : summary.length === 0 ? (
        <Card className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
          <p>No transactions with assigned payment methods found.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-primary/5 border-primary/20 p-6 flex flex-col justify-between min-h-[140px]">
              <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider">
                Total Expenses
              </p>
              <p className="text-3xl font-bold text-foreground">
                {currencyFormatter.format(totalExpense)}
              </p>
            </Card>

            <Card className="bg-ui-surface-muted border-ui-border-subtle p-6 flex flex-col justify-between min-h-[140px]">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Methods Used
              </p>
              <p className="text-3xl font-bold text-foreground">{summary.length}</p>
            </Card>
          </div>

          {/* Detailed List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground px-1">
              Spending Breakdown
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summary.map((s, idx) => (
                <Card
                  key={s.paymentMethod?.id ?? 'unspecified-' + idx}
                  className="p-5 flex flex-col gap-4 border border-ui-border-subtle hover:border-primary/50 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-surface-muted text-foreground font-bold shrink-0">
                      {s.paymentMethod ? s.paymentMethod.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {s.paymentMethod?.name ?? 'Unspecified'}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {s.paymentMethod ? (s.paymentMethod.isGlobal ? 'System' : 'Custom') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-ui-border-subtle">
                    <p className="text-2xl font-bold text-foreground">
                      {currencyFormatter.format(s.totalAmount)}
                    </p>
                    <div className="mt-2 h-1.5 w-full bg-ui-surface-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(s.totalAmount / totalExpense) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-muted-foreground font-medium text-right">
                      {((s.totalAmount / totalExpense) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
