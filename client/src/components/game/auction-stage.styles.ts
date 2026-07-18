import { tv } from "tailwind-variants"

export const stage = tv({
  base: "relative flex flex-1 flex-col items-center justify-center gap-6 py-6",
})

/** Warm lamplight halo behind the lot on the block. */
export const lamplight = tv({
  base: "pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,--alpha(var(--color-primary)/18%),transparent_70%)]",
})

export const lot = tv({
  base: "animate-lot-reveal",
})

export const lotLabel = tv({
  base: "text-sm tracking-widest text-secondary uppercase",
})

export const placard = tv({
  base: "flex min-w-72 flex-col items-center gap-1 rounded-lg border border-border bg-surface/80 px-6 py-3 text-center",
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

export const queueNote = tv({
  base: "text-sm text-secondary",
})
