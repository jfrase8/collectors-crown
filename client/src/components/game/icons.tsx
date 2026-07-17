import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

/** A small stack of cards — the player's collection. */
export function CollectionIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="7.5" y="4.5" width="11" height="15" rx="1.5" />
      <path d="M5 7v11.5A1.5 1.5 0 0 0 6.5 20H15" transform="translate(-1.5 -1)" />
    </Icon>
  )
}

/** Seated players. */
export function PlayersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16 14.2c2.3.2 4 1.8 4.5 4.3" />
    </Icon>
  )
}

/** The discard pile. */
export function DiscardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6" y="3.5" width="12" height="16" rx="1.5" transform="rotate(8 12 11.5)" />
      <path d="M9 9.5l6 6M15 9.5l-6 6" transform="rotate(8 12 12.5)" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  )
}
