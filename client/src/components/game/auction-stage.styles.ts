import { tv } from "tailwind-variants"

export const stage = tv({
  base: "relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 py-2",
})

export const lotLabel = tv({
  base: "text-sm tracking-widest text-secondary uppercase",
})

export const placard = tv({
  base: "flex min-w-72 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface/80 px-6 py-3 text-center transition-[min-height] duration-500 ease-out",
  variants: {
    myTurn: {
      true: "min-h-36",
      false: "min-h-20",
    },
  },
  defaultVariants: { myTurn: false },
})

export const highBid = tv({
  base: "font-display text-2xl",
  variants: {
    empty: {
      true: "text-secondary",
      false: "text-primary",
    },
  },
})

export const bidderName = tv({
  base: "text-sm text-secondary",
})

export const controls = tv({
  base: "flex items-center gap-2",
})

export const status = tv({
  base: "text-secondary italic",
})
