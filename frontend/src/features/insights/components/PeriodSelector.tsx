import { Select } from '../../../shared/components/Select'
import type { PeriodOption } from '../types'

interface PeriodSelectorProps {
  value: PeriodOption
  onChange: (value: PeriodOption) => void
}

const OPTIONS = [
  { value: 'CURRENT_MONTH', label: 'Current Month' },
  { value: 'LAST_MONTH', label: 'Last Month' },
  { value: 'LAST_3_MONTHS', label: 'Last 3 Months' },
  { value: 'ALL_TIME', label: 'One Year' },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="w-full">
      <Select
        id="period-selector"
        label="Analysis Period"
        aria-label="Analysis period"
        options={OPTIONS}
        value={value}
        onChange={(val) => onChange(val as PeriodOption)}
      />
    </div>
  )
}
