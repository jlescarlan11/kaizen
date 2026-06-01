import { type ReactElement } from 'react'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'
import { withOpacity } from '../../../shared/lib/colorUtils'

interface TransactionDetailInfoProps {
  category?: {
    name: string
    icon: string
    color: string
  }
  paymentMethod?: {
    name: string
  }
  description?: string | null
  className?: string
}

export function TransactionDetailInfo({
  category,
  paymentMethod,
  description,
  className,
}: TransactionDetailInfoProps): ReactElement {
  return (
    <div className={cn('divide-y divide-border-subtle', className)}>
      {/* Category */}
      <InfoRow label="Category">
        {category ? (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: withOpacity(category.color, 0.08),
                color: category.color,
              }}
            >
              <SharedIcon type="category" name={category.icon} size={16} />
            </div>
            <span className="text-sm font-semibold text-text-primary">{category.name}</span>
          </div>
        ) : (
          <span className="text-sm italic text-text-secondary">No Category</span>
        )}
      </InfoRow>

      {/* Account */}
      <InfoRow label="Account">
        {paymentMethod ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface-secondary text-xs font-semibold text-text-primary">
              {paymentMethod.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-text-primary">{paymentMethod.name}</span>
          </div>
        ) : (
          <span className="text-sm italic text-text-secondary">No Payment Method</span>
        )}
      </InfoRow>

      {/* Description */}
      <div className="px-6 py-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Description
        </p>
        {description ? (
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{description}</p>
        ) : (
          <p className="text-sm italic text-text-secondary">No description</p>
        )}
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  children: React.ReactNode
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      {children}
    </div>
  )
}
