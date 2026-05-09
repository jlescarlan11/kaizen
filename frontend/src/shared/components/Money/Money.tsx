import React from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import { selectIsPrivacyMode } from '../../../app/store/uiSlice'
import { cn } from '../../lib/cn'

interface MoneyProps {
  amount: number
  currency?: string
  className?: string
  showSign?: boolean
  decimalPlaces?: number
}

export const Money: React.FC<MoneyProps> = ({
  amount,
  currency = 'PHP',
  className,
  showSign = false,
  decimalPlaces = 2,
}) => {
  const isPrivacyMode = useAppSelector(selectIsPrivacyMode)
  const isNegative = amount < 0
  const absAmount = Math.abs(amount)

  const formattedValue = absAmount.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })

  return (
    <span
      className={cn('inline-flex items-baseline gap-1 transition-all duration-300', className)}
      aria-label={isPrivacyMode ? 'Hidden Balance' : `${currency} ${amount}`}
    >
      {isPrivacyMode ? (
        <span className="font-black tracking-tighter select-none text-text-tertiary/40">
          ••••••
        </span>
      ) : (
        <>
          <span className="opacity-40 font-bold text-[0.8em]">{currency}</span>
          <span className="font-black tracking-tighter">
            {showSign && (isNegative ? '-' : '+')}
            {formattedValue}
          </span>
        </>
      )}
    </span>
  )
}
