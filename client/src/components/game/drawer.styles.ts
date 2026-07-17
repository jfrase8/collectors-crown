import { tv } from "tailwind-variants"

export const drawerOverlay = tv({
  base: "fixed inset-0 z-10 bg-black/50 backdrop-blur-xs data-entering:animate-fade-in data-exiting:animate-fade-out",
})

export const drawerBox = tv({
  base: "fixed inset-y-0 right-0 z-10 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl data-entering:animate-drawer-in data-exiting:animate-drawer-out",
})

export const drawerDialog = tv({
  base: "flex min-h-0 flex-1 flex-col outline-none",
})

export const drawerHeader = tv({
  base: "flex items-center justify-between border-b border-border px-5 py-4",
})

export const drawerTitle = tv({
  base: "font-display text-lg tracking-wide",
})

export const drawerBody = tv({
  base: "min-h-0 flex-1 overflow-y-auto px-5 py-4",
})

export const triggerBadge = tv({
  base: "text-sm leading-none",
})

export const triggerTooltip = tv({
  base: "rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-secondary shadow-lg",
})
