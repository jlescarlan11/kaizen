import { cn } from '../lib/cn'

interface CircleGaugeProps {
  percent: number
  label: string
  sublabel?: string
  radius?: number
  strokeWidth?: number
  className?: string
}

export function CircleGauge({
  percent,
  label,
  sublabel,
  radius = 30,
  strokeWidth = 7,
  className,
}: CircleGaugeProps) {
  const circumference = 2 * Math.PI * radius
  const offset =
    circumference - (Math.min(100, Math.max(0, isNaN(percent) ? 0 : percent)) / 100) * circumference

  return (
    <div className={cn('relative flex items-center justify-center shrink-0', className)}>
      <svg
        className="w-20 h-20 -rotate-90"
        viewBox="0 0 80 80"
        role="img"
        aria-label={`${label}${sublabel ? ' ' + sublabel : ''}`}
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-surface-secondary"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          fill="transparent"
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-lg font-black text-text-primary leading-none">{label}</span>
        {sublabel && (
          <span className="text-6xs font-bold text-text-tertiary uppercase tracking-tighter mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
