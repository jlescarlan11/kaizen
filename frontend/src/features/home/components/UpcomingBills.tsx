import React, { useMemo } from 'react'
import { useGetTransactionsQuery } from '../../../app/store/api/transactionApi'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatGroupDate } from '../../transactions/utils/transactionUtils'

export const UpcomingBills: React.FC = () => {
  // We fetch a larger page to ensure we find recurring/future transactions if they exist
  // Ideally, we'd have a specific endpoint for "reminders" or "upcoming"
  const { data: transactionsData, isLoading } = useGetTransactionsQuery({ pageSize: 50 })

  const upcoming = useMemo(() => {
    if (!transactionsData?.items) return []

    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    return transactionsData.items
      .filter((tx) => {
        const txDate = new Date(tx.transactionDate)
        // Future dated OR explicitly recurring
        return (txDate > now && txDate <= nextWeek) || tx.isRecurring
      })
      .slice(0, 3)
  }, [transactionsData])

  if (isLoading || upcoming.length === 0) return null

  return (
    <div className="mb-6 animate-entrance-slide-up">
      <div className="flex items-center gap-2 mb-4 px-2">
        <SharedIcon type="ui" name="alert-circle" size={14} className="text-warning" />
        <p className="text-3xs font-black uppercase tracking-widest text-text-primary">
          Upcoming Next 7 Days
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {upcoming.map((tx) => (
          <div
            key={tx.id}
            className="p-4 rounded-3xl bg-surface border border-warning/20 shadow-sm flex flex-col justify-between hover:border-warning/40 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="h-8 w-8 rounded-xl bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                <SharedIcon type="ui" name="recurring" size={16} />
              </div>
              <span className="text-4xs font-black text-warning uppercase bg-warning/10 px-2 py-0.5 rounded-full">
                {tx.isRecurring ? 'Recurring' : 'Scheduled'}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-text-primary truncate">{tx.description}</p>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-3xs font-black text-text-tertiary uppercase leading-none mb-1">
                    Due
                  </p>
                  <p className="text-2xs font-bold text-text-primary leading-none">
                    {formatGroupDate(tx.transactionDate.split('T')[0])}
                  </p>
                </div>
                <p className="text-sm font-black text-text-primary">
                  -${tx.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
