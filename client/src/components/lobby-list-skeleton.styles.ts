import { tv } from "tailwind-variants"

export const skeletonList = tv({
  base: "flex animate-pulse flex-col gap-2",
})

export const skeletonRow = tv({
  base: "flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3",
})

export const skeletonBlock = tv({
  base: "rounded bg-border/60",
  variants: {
    size: {
      name: "h-4 w-40",
      meta: "h-3 w-24",
      button: "h-10 w-16 rounded-md",
    },
  },
})
