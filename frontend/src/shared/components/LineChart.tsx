import type { HTMLAttributes, ReactElement } from 'react'
import { useMemo } from 'react'
import { cn } from '../lib/cn'

export interface DataPoint {
  label: string
  value: number // 0 to 100 for normalization
}

export interface LineChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  data: DataPoint[]
  activeIndex?: number
  onPointSelect?: (index: number) => void
  height?: number
}

export function LineChart({
  data,
  activeIndex,
  onPointSelect,
  height = 260, // Increased from 240
  className,
  ...props
}: LineChartProps): ReactElement {
  // Layout Constants
  const width = 1000 // Fixed internal coordinate system
  const padding = useMemo(() => ({ top: 20, right: 20, bottom: 60, left: 20 }), []) // Increased bottom padding
  const selectorY = height - 45 // Moved up to create space below it

  // 1. Calculate Coordinates
  const points = useMemo(() => {
    if (data.length === 0) return []
    const xStep = (width - padding.left - padding.right) / (data.length - 1)
    const chartHeight = height - padding.top - padding.bottom

    return data.map((d, i) => ({
      x: padding.left + i * xStep,
      y: height - padding.bottom - (d.value / 100) * chartHeight,
    }))
  }, [data, width, height, padding])

  // 2. Generate Wavy Path (Cubic Bezier)
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
      const smoothing = 0.15
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
      <div style={{ minWidth: `${width}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wavy Connection Line (Trend) */}
          <path
            d={linePath}
            stroke="var(--color-border-strong)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="opacity-40"
          />

          {/* Interactive Selector Layer */}
          {points.map((point, i) => {
            const isActive = i === activeIndex
            const label = data[i].label

            return (
              <g
                key={`selector-${i}`}
                className="cursor-pointer group"
                onClick={() => onPointSelect?.(i)}
              >
                {/* Invisible touch target to make clicking EASY */}
                <rect x={point.x - 25} y={0} width="50" height={height} fill="transparent" />

                {/* Selector Visual (Pill for Active, Circle for Inactive) */}
                {isActive ? (
                  <rect
                    x={point.x - 10}
                    y={point.y - 10} // Start slightly above the point
                    width="20"
                    height={selectorY - point.y + 20} // Stretch down to selector row
                    rx="10"
                    fill="var(--color-text-primary)"
                    className="transition-all duration-300"
                  />
                ) : (
                  <circle
                    cx={point.x}
                    cy={selectorY}
                    r="10"
                    fill="var(--color-surface)"
                    stroke="var(--color-border)"
                    strokeWidth="2"
                    style={{ transformOrigin: `${point.x}px ${selectorY}px` }}
                    className="transition-transform duration-200 group-hover:scale-125"
                  />
                )}

                {/* Month Label */}
                <text
                  x={point.x}
                  y={height - 5}
                  textAnchor="middle"
                  fill={isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}
                  fontSize="18"
                  fontWeight={isActive ? '700' : '500'}
                  className="transition-colors duration-200"
                >
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
