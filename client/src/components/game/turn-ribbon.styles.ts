import { tv } from "tailwind-variants"

export const ribbon = tv({
  base: "flex flex-wrap items-center justify-center gap-2",
})

// Each plaque overrides --color-primary with its player's color (inline, in
// turn-ribbon.tsx), so border-primary/text-primary/the turn-pulse glow all
// resolve to that player's color.
export const plaque = tv({
  base: "flex items-baseline gap-2 rounded-md border border-primary/70 px-3 py-1.5 transition-colors",
  variants: {
    active: {
      true: "bg-primary/10 shadow-[0_0_16px_-4px_var(--color-primary)]",
      false: "bg-surface",
    },
    dimmed: {
      true: "opacity-50",
    },
    yourTurn: {
      true: "animate-turn-pulse border-primary",
    },
  },
  defaultVariants: { active: false },
})

export const plaqueName = tv({
  base: "font-medium text-primary",
})

export const plaqueMeta = tv({
  base: "text-sm text-secondary",
})
