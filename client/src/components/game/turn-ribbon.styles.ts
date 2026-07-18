import { tv } from "tailwind-variants"

export const ribbon = tv({
  base: "flex flex-wrap items-center justify-center gap-2",
})

export const plaque = tv({
  base: "flex items-baseline gap-2 rounded-md border px-3 py-1.5 transition-colors",
  variants: {
    active: {
      true: "border-primary/70 bg-primary/10 shadow-[0_0_16px_-4px_var(--color-primary)]",
      false: "border-border bg-surface",
    },
    dimmed: {
      true: "opacity-50",
    },
  },
  defaultVariants: { active: false },
})

export const plaqueName = tv({
  base: "font-medium",
  variants: {
    active: {
      true: "text-primary",
    },
  },
})

export const plaqueMeta = tv({
  base: "text-sm text-secondary",
})
