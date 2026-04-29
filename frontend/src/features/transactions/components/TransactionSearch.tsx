import type { ReactElement } from 'react'
import { Input } from '../../../shared/components/Input'
import { SharedIcon } from '../../../shared/components/IconRegistry'

interface TransactionSearchProps {
  value: string
  onChange: (value: string) => void
}

export function TransactionSearch({ value, onChange }: TransactionSearchProps): ReactElement {
  return (
    <div className="w-full max-w-md">
      <Input
        placeholder="Search Transactions"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 border-ui-border-subtle bg-ui-surface-muted/30 focus:bg-ui-surface transition-colors"
        startAdornment={<SharedIcon type="ui" name="search" size={16} />}
        endAdornment={
          value ? (
            <button
              onClick={() => onChange('')}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 pointer-events-auto"
              aria-label="Clear search"
            >
              <SharedIcon type="ui" name="close" size={16} />
            </button>
          ) : null
        }
      />
    </div>
  )
}
