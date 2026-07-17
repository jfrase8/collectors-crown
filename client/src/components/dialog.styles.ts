import { tv } from "tailwind-variants"

export const dialogForm = tv({
  base: "flex flex-col gap-4",
})

export const dialogTitle = tv({
  base: "text-primary text-2xl font-bold",
})

export const dialogError = tv({
  base: "text-sm text-red-400",
})

export const dialogActions = tv({
  base: "flex justify-end gap-2",
})
