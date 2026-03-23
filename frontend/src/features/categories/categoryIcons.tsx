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

export function BookIcon({ size }: IconProps): ReactElement {
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
      <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H20v15H8.5A2.5 2.5 0 0 0 6 20.5z" />
      <path d="M6 5.5v15" />
      <path d="M10 7h6" />
      <path d="M10 10h6" />
    </svg>
  )
}

export function WalletIcon({ size }: IconProps): ReactElement {
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
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M4 8h14" />
      <path d="M16 13h4" />
      <circle cx="15.5" cy="13" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ReceiptIcon({ size }: IconProps): ReactElement {
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
      <path d="M7 3h10v18l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5a2 2 0 0 1 2-2z" />
      <path d="M9 8h6" />
      <path d="M9 11h6" />
      <path d="M9 14h4" />
    </svg>
  )
}

export function CreditCardIcon({ size }: IconProps): ReactElement {
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
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14h3" />
    </svg>
  )
}

export function ShoppingBagIcon({ size }: IconProps): ReactElement {
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
      <path d="M6 8h12l-1 12H7z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export function PlaneIcon({ size }: IconProps): ReactElement {
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
      <path d="m3 13 18-6-5 10-3-2-3 4-1-5z" />
      <path d="m13 15 8-8" />
    </svg>
  )
}

export function UsersIcon({ size }: IconProps): ReactElement {
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
      <circle cx="9" cy="9" r="3" />
      <circle cx="16.5" cy="10.5" r="2.5" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <path d="M14 19a4 4 0 0 1 6 0" />
    </svg>
  )
}

export function SparklesIcon({ size }: IconProps): ReactElement {
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
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="m19 14 .75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75z" />
      <path d="m5 14 .75 2.25L8 17l-2.25.75L5 20l-.75-2.25L2 17l2.25-.75z" />
    </svg>
  )
}

export function BanknoteIcon({ size }: IconProps): ReactElement {
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
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 9.5h.01" />
      <path d="M17 14.5h.01" />
    </svg>
  )
}

export function ShieldIcon({ size }: IconProps): ReactElement {
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
      <path d="M12 3 5 6v5c0 4.5 2.9 7.9 7 10 4.1-2.1 7-5.5 7-10V6z" />
      <path d="M9.5 12.5 11 14l3.5-3.5" />
    </svg>
  )
}

export function LaptopIcon({ size }: IconProps): ReactElement {
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
      <rect x="5" y="5" width="14" height="10" rx="1.5" />
      <path d="M3 18h18" />
      <path d="M9 18h6" />
    </svg>
  )
}

export function GiftIcon({ size }: IconProps): ReactElement {
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
      <path d="M4 10h16v10H4z" />
      <path d="M12 10v10" />
      <path d="M4 14h16" />
      <path d="M12 10H8.5A2.5 2.5 0 1 1 12 6.5z" />
      <path d="M12 10h3.5A2.5 2.5 0 1 0 12 6.5z" />
    </svg>
  )
}

export function DumbbellIcon({ size }: IconProps): ReactElement {
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
      <path d="M4 10v4" />
      <path d="M7 9v6" />
      <path d="M17 9v6" />
      <path d="M20 10v4" />
      <path d="M7 12h10" />
      <path d="M2.5 9v6" />
      <path d="M21.5 9v6" />
    </svg>
  )
}

export function PawPrintIcon({ size }: IconProps): ReactElement {
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
      <ellipse cx="8" cy="8" rx="1.75" ry="2.25" />
      <ellipse cx="15.5" cy="8" rx="1.75" ry="2.25" />
      <ellipse cx="6" cy="13" rx="1.5" ry="2" />
      <ellipse cx="17.5" cy="13" rx="1.5" ry="2" />
      <path d="M12 19c2.6 0 4-1.6 4-3.4S14.6 12 12 12s-4 1.8-4 3.6S9.4 19 12 19Z" />
    </svg>
  )
}
