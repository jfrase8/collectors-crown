import { tv } from "tailwind-variants"

export const row = tv({
  base: "flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3",
})

export const rowName = tv({
  base: "truncate font-medium",
})

export const rowMeta = tv({
  base: "text-sm text-secondary",
})
