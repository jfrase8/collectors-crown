import type { Category, TraitId } from "@collectors-crown/shared"
import type { ComponentType, SVGProps } from "react"

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

/** The collector's crown — used on card price banners. */
export function CrownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 17.5 3.5 8l4.6 3.4L12 5.5l3.9 5.9L20.5 8l-1 9.5z" />
      <path d="M6.5 20.5h11" />
    </Icon>
  )
}

// --- Trait icons -----------------------------------------------------------

/** Rising value each round. */
export function AppreciationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 17.5 9.5 11l4 4 7-7.5" />
      <path d="M15.5 7.5h5v5" />
    </Icon>
  )
}

/** Bonus per other card of the same category — a stack of layers. */
export function CollectionTraitIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 20 8l-8 4.5L4 8z" />
      <path d="M4 12.5 12 17l8-4.5" />
      <path d="M4 16.5 12 21l8-4.5" />
    </Icon>
  )
}

/** Part of a 3-card set — fanned cards. */
export function SetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="7" y="5" width="9.5" height="13.5" rx="1" transform="rotate(-8 11.75 11.75)" />
      <rect x="9" y="6" width="9.5" height="13.5" rx="1" transform="rotate(8 13.75 12.75)" />
    </Icon>
  )
}

/** Rare — a four-point sparkle. */
export function RarityIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3c.6 4.6 2.4 6.4 9 9-6.6 2.6-8.4 4.4-9 9-.6-4.6-2.4-6.4-9-9 6.6-2.6 8.4-4.4 9-9z" />
    </Icon>
  )
}

/** Historical pairing — linked chain. */
export function PairingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.3 13.7a4 4 0 0 1 0-5.6l2.4-2.4a4 4 0 0 1 5.6 5.6l-1.6 1.6" />
      <path d="M13.7 10.3a4 4 0 0 1 0 5.6l-2.4 2.4a4 4 0 0 1-5.6-5.6l1.6-1.6" />
    </Icon>
  )
}

// --- Category icons --------------------------------------------------------

export function CoinsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <ellipse cx="12" cy="6.5" rx="6.5" ry="2.8" />
      <path d="M5.5 6.5v5c0 1.55 2.9 2.8 6.5 2.8s6.5-1.25 6.5-2.8v-5" />
      <path d="M5.5 11.5v5c0 1.55 2.9 2.8 6.5 2.8s6.5-1.25 6.5-2.8v-5" />
    </Icon>
  )
}

export function StampIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="0.5" strokeDasharray="2.6 2" />
      <rect x="7.5" y="7.5" width="9" height="9" />
    </Icon>
  )
}

export function PaintingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1" />
      <circle cx="9" cy="9.5" r="1.5" />
      <path d="M3.5 16.5 8 12l3.5 3.5 3-3 6 5" />
    </Icon>
  )
}

export function WatchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 9.5V12l2 1.5" />
      <path d="M9.5 6.3 10 3h4l.5 3.3M9.5 17.7 10 21h4l.5-3.3" />
    </Icon>
  )
}

export function ComicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 4v-4h-1A2.5 2.5 0 0 1 4 13.5z" />
      <path d="M8.5 8.5h7M8.5 11.5h4.5" />
    </Icon>
  )
}

export function RelicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 3.5h5" />
      <path d="M10 3.5c0 2-.6 3.1-2.4 4.5-2 1.6-2.6 4.3-1.1 7 1 2 2.8 3.5 5.5 3.5s4.5-1.5 5.5-3.5c1.5-2.7.9-5.4-1.1-7C14.6 6.6 14 5.5 14 3.5" />
      <path d="M9 21h6" />
    </Icon>
  )
}

export const TRAIT_ICONS: Record<TraitId, ComponentType<IconProps>> = {
  appreciation: AppreciationIcon,
  collection: CollectionTraitIcon,
  set: SetIcon,
  rarity: RarityIcon,
  pairing: PairingIcon,
}

export const CATEGORY_ICONS: Record<Category, ComponentType<IconProps>> = {
  Coins: CoinsIcon,
  Stamps: StampIcon,
  Paintings: PaintingIcon,
  Watches: WatchIcon,
  Comics: ComicIcon,
  Relics: RelicIcon,
}
