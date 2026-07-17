import { tv } from "tailwind-variants"

export const field = tv({
  base: "flex flex-col gap-1.5",
})

export const fieldLabel = tv({
  base: "text-sm font-medium text-secondary",
})

export const fieldInput = tv({
  base: "rounded-md border border-border bg-surface px-3 py-2 text-secondary outline-none focus:border-primary",
})
