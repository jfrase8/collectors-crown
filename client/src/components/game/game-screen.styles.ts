import { tv } from "tailwind-variants"

export const screen = tv({
  base: "mx-auto flex h-screen max-w-6xl flex-col gap-3 overflow-hidden px-4 py-4",
})

export const header = tv({
  base: "flex shrink-0 flex-col items-center gap-2",
})

export const eyebrow = tv({
  base: "text-sm tracking-[0.25em] text-secondary uppercase",
})

export const tierTitle = tv({
  base: "font-display text-3xl tracking-wide",
})

export const bottomBar = tv({
  base: "flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface/80 px-5 py-3",
})

export const cashLabel = tv({
  base: "text-xs tracking-widest text-secondary uppercase",
})

export const cashValue = tv({
  base: "font-display text-2xl text-primary",
})

export const errorLine = tv({
  base: "text-center text-sm text-red-400",
})
