import { tv } from "tailwind-variants"

export const modalOverlay = tv({
  base: "fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
})

export const modalBox = tv({
  base: "w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-xl",
})

export const modalDialog = tv({
  base: "outline-none",
})
