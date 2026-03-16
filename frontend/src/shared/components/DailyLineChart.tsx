import type { HTMLAttributes, ReactElement } from 'react'
import { useMemo } from 'react'
import { cn } from '../lib/cn'

export interface DailyDataPoint {
  day: number
  value: number // 0 to 100
}

export interface DailyLineChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  data: DailyDataPoint[]
  activeIndex?: number
  onPointSelect?: (index: number) => void
  height?: number
}

export function DailyLineChart({
  data,
  activeIndex,
  onPointSelect,
  height = 220, // Increased from 200
  className,
  ...props
}: DailyLineChartProps): ReactElement {
  const width = 1200 // Wider internal system for more points
  const padding = useMemo(() => ({ top: 10, right: 10, bottom: 50, left: 10 }), []) // Increased bottom padding
  const selectorY = height - 40 // Moved up

  const points = useMemo(() => {
    if (data.length === 0) return []
    const xStep = (width - padding.left - padding.right) / (data.length - 1)
    const chartHeight = height - padding.top - padding.bottom

    return data.map((d, i) => ({
      x: padding.left + i * xStep,
      y: height - padding.bottom - (d.value / 100) * chartHeight,
    }))
  }, [data, width, height, padding])

  const linePath = useMemo(() => {
    if (points.length < 2) return ''

    const getControlPoint = (
      current: { x: number; y: number },
      previous: { x: number; y: number } | null,
      next: { x: number; y: number } | null,
      reverse?: boolean,
    ) => {
      const p = previous ?? current
      const n = next ?? current
      const smoothing = 0.12 // Slightly less smoothing for dense data
      const lengthX = n.x - p.x
      const lengthY = n.y - p.y
      const angle = Math.atan2(lengthY, lengthX) + (reverse ? Math.PI : 0)
      const distance = Math.sqrt(Math.pow(n.x - p.x, 2) + Math.pow(n.y - p.y, 2)) * smoothing
      return {
        x: current.x + Math.cos(angle) * distance,
        y: current.y + Math.sin(angle) * distance,
      }
    }

    return points.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x} ${point.y}`
      const cp1 = getControlPoint(a[i - 1], a[i - 2], point)
      const cp2 = getControlPoint(point, a[i - 1], a[i + 1], true)
      return `${acc} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${point.x} ${point.y}`
    }, '')
  }, [points])

  return (
    <div
      className={cn('w-full select-none overflow-x-auto pb-4 scrollbar-hide', className)}
      {...props}
    >
      <div className="min-w-300">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Trend Line */}
          <path
            d={linePath}
            stroke="var(--color-border-strong)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="opacity-30"
          />

          {/* Interactive Layer */}
          {points.map((point, i) => {
            const isActive = i === activeIndex
            const day = data[i].day
            const showLabel = day === 1 || day % 5 === 0 || i === data.length - 1

            return (
              <g
                key={`day-${i}`}
                className="cursor-pointer group"
                onClick={() => onPointSelect?.(i)}
              >
                {/* Large hit target */}
                <rect
                  x={point.x - width / data.length / 2}
                  y={0}
                  width={width / data.length}
                  height={height}
                  fill="transparent"
                />

                {/* Selector Visual (Slender Pill for Active, Small Circle for Inactive) */}
                {isActive ? (
                  <rect
                    x={point.x - 4}
                    y={point.y - 6}
                    width="8"
                    height={selectorY - point.y + 12}
                    rx="4"
                    fill="var(--color-text-primary)"
                    className="transition-all duration-300"
                  />
                ) : (
                  <circle
                    cx={point.x}
                    cy={selectorY}
                    r="3"
                    fill="var(--color-surface)"
                    stroke="var(--color-border)"
                    strokeWidth="1.5"
                    className="transition-transform duration-200 group-hover:scale-150 origin-center transform-fill"
                  />
                )}

                {/* Day Label */}
                {showLabel && (
                  <text
                    x={point.x}
                    y={height - 5}
                    textAnchor="middle"
                    fill={isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}
                    fontSize="14"
                    fontWeight={isActive ? '700' : '500'}
                    className="transition-colors duration-200"
                  >
                    {day}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
