import { tv } from "tailwind-variants"

/** Full-detail card, laid out like a printed collectible card. */
export const card = tv({
  slots: {
    root: "relative isolate flex h-112 w-64 flex-col overflow-hidden rounded-lg border border-border bg-surface text-left shadow-lg",
    /** Thin inner frame echoing the outer border; lighter fill behind the content. */
    frame:
      "pointer-events-none absolute inset-1.5 -z-10 rounded-md border border-border bg-frame",
    tierBanner:
      "font-display relative mx-auto rounded-b-md border border-t-0 border-border bg-background px-4 pt-0.5 pb-1 text-[11px] tracking-[0.25em] uppercase",
    name: "font-display truncate px-4 pt-2 text-center text-xl leading-tight",
    seal: "mx-auto my-3 flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-double",
    sealInitial: "font-display select-none text-5xl",
    categoryRow:
      "relative mx-4 flex items-center gap-2 rounded-sm border border-border bg-background/60 px-2.5 py-1.5",
    categoryLabel: "text-xs tracking-widest text-secondary uppercase",
    traitBox:
      "relative mx-4 mt-2 flex items-start gap-3 rounded-md border border-border p-3",
    traitBadge:
      "flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary",
    traitLabel: "text-[10px] tracking-widest text-secondary uppercase",
    traitName: "font-display text-base leading-tight uppercase",
    traitDesc: "pt-1 text-sm leading-snug text-secondary",
    history: "px-5 pt-2 pb-1 text-center text-xs text-secondary italic",
    banner:
      "relative mx-1.5 mt-auto mb-1.5 flex flex-col items-center rounded-b-md border border-border bg-background px-3 pt-1.5 pb-2",
    printed: "text-[10px] tracking-widest text-secondary uppercase",
    value: "font-display text-2xl leading-tight",
  },
})

/** Low-detail tile: symbols over text. Hover reveals the full card. */
export const compactCard = tv({
  slots: {
    root: "relative flex h-24 w-36 flex-col overflow-hidden rounded-lg border border-border bg-surface text-left shadow-lg",
    trim: "h-1 w-full shrink-0",
    header: "flex items-center justify-between px-3 pt-1.5",
    tier: "font-display text-xs tracking-widest",
    name: "my-auto truncate px-3 text-center text-sm leading-tight",
    footer: "flex items-center justify-between px-3 pb-1.5",
    traitIcon: "text-secondary",
    value: "text-sm leading-none font-semibold",
  },
})
