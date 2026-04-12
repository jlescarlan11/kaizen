import { type ReactElement } from 'react'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'

interface TransactionDetailInfoProps {
  category?: {
    name: string
    icon: string
    color: string
  }
  paymentMethod?: {
    name: string
  }
  type: 'INCOME' | 'EXPENSE'
  className?: string
}

export function TransactionDetailInfo({
  category,
  paymentMethod,
  type,
  className,
}: TransactionDetailInfoProps): ReactElement {
  const isExpense = type === 'EXPENSE'
  const isIncome = type === 'INCOME'

  return (
    <div className={cn('space-y-12', className)}>
      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-8 border-y border-ui-border-subtle">
        <InfoBlock label="Flow">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                isIncome
                  ? 'bg-ui-success/10 text-ui-success'
                  : 'bg-ui-surface-muted text-foreground',
              )}
            >
              <SharedIcon
                type="category"
                name={isIncome ? 'trending-up' : isExpense ? 'trending-down' : 'refresh-cw'}
                size={20}
              />
            </div>
            <p className="text-lg font-bold text-foreground capitalize">
              {isIncome ? 'Income' : isExpense ? 'Expense' : 'Adjustment'}
            </p>
          </div>
        </InfoBlock>

        <InfoBlock label="Category">
          {category ? (
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                style={{
                  backgroundColor: category.color + '15',
                  color: category.color,
                }}
              >
                <SharedIcon type="category" name={category.icon} size={20} />
              </div>
              <span className="text-lg font-bold text-foreground">{category.name}</span>
            </div>
          ) : (
            <span className="italic text-muted-foreground">No Category</span>
          )}
        </InfoBlock>

        <InfoBlock label="Account">
          {paymentMethod ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-surface-strong text-foreground text-sm font-black border border-ui-border">
                {paymentMethod.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-lg font-bold text-foreground">{paymentMethod.name}</span>
            </div>
          ) : (
            <span className="italic text-muted-foreground">No Payment Method</span>
          )}
        </InfoBlock>
      </div>
    </div>
  )
}

interface InfoBlockProps {
  label: string
  children: React.ReactNode
  fullWidth?: boolean
}

function InfoBlock({ label, children, fullWidth }: InfoBlockProps) {
  return (
    <div className={cn('flex flex-col gap-2', fullWidth ? 'md:col-span-2' : '')}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}
