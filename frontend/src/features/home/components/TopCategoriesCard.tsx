import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCategoryBreakdownQuery } from '../../../app/store/api/insightsApi'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { CategoryIcon } from '../../categories/CategoryIcon'
import { DashboardCard, CardHeader, CardSkeleton } from '../../../shared/components'

export const TopCategoriesCard: React.FC = () => {
  const navigate = useNavigate()
  const dateRange = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 29)
    return { start: start.toISOString(), end: end.toISOString() }
  }, [])

  const { data, isLoading } = useGetCategoryBreakdownQuery(dateRange)

  if (isLoading) {
    return (
      <CardSkeleton className="flex flex-col gap-3">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-surface-secondary rounded" />
                <div className="h-3 w-12 bg-surface-secondary rounded" />
              </div>
              <div className="h-1.5 w-full bg-surface-secondary rounded-full" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    )
  }

  const categories = data?.categories.slice(0, 4) ?? []

  return (
    <DashboardCard className="flex flex-col group">
      <CardHeader
        icon={<SharedIcon type="ui" name="filter" size={14} className="text-primary" />}
        title="Top Categories"
        right={<span className="text-3xs font-medium text-text-tertiary/60">L30D</span>}
        className="mb-4"
      />

      <div className="flex flex-col gap-3 flex-grow">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat.categoryId ?? 'misc'} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-md bg-surface-secondary flex items-center justify-center border border-border-subtle">
                    <CategoryIcon icon={cat.categoryName} size={10} />
                  </div>
                  <span className="text-2xs font-medium text-text-primary truncate max-w-[100px]">
                    {cat.categoryName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-semibold text-text-primary tabular-nums">
                    ${cat.total.toLocaleString()}
                  </span>
                  <span className="text-4xs font-medium text-text-tertiary/60 tabular-nums w-7 text-right">
                    {Math.round(cat.percentage)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-2xs font-medium text-text-tertiary/60">No Data Found</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle">
        <button
          onClick={() => navigate('/insights')}
          className="w-full text-center text-2xs font-medium text-primary hover:underline"
        >
          View Full Breakdown
        </button>
      </div>
    </DashboardCard>
  )
}
