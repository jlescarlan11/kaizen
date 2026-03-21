import type { ReactElement } from 'react'
interface IconProps {
  size: number
}

export function HomeIcon({ size }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="presentation"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.75"
    >
      <path d="M3 11 12 3l9 8" />
      <path d="M7 10v9h4v-6h2v6h4v-9" />
    </svg>
  )
}

export function UtensilsIcon({ size }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="presentation"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.75"
    >
      <path d="M7 4v16" />
      <path d="m10 4-3 7v7" />
      <path d="M17 4v16" />
      <path d="M20 4v7a3 3 0 0 1-6 0V4" />
    </svg>
  )
}

export function CarIcon({ size }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="presentation"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.75"
    >
      <path d="M3 13h18l-1.5-4H4.5z" />
      <path d="M5 13v4h1.5" />
      <path d="M17.5 17h1.5V13" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  )
}

export function BoltIcon({ size }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="presentation"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.75"
    >
      <path d="m13 2-7 11h6l-1 9 7-11h-6z" />
    </svg>
  )
}

export function HeartbeatIcon({ size }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="presentation"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.75"
    >
      <path d="M3 11.5h2l1-2 2 4 3-6 1.5 3 2-4 2 4 2-2 2 2" />
      <path d="M20.5 14.5a3.5 3.5 0 0 1-5 0l-1.5-1.5-1.5 1.5a3.5 3.5 0 0 1-5-5l3-3 3 3 1.5-1.5 1.5 1.5" />
    </svg>
  )
}

export function FilmIcon({ size }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="presentation"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.75"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <circle cx="7" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="7" cy="17.5" r="0.5" fill="currentColor" />
      <circle cx="17" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17" cy="17.5" r="0.5" fill="currentColor" />
    </svg>
  )
}
