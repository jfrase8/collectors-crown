import { tv } from "tailwind-variants"

/** Full-detail card, laid out like a printed collectible card. */
export const card = tv({
  slots: {
    root: "relative isolate flex h-112 w-64 flex-col overflow-hidden rounded-lg border border-border bg-surface text-left shadow-lg",
    /** Thin inner frame echoing the outer border; lighter fill behind the content. */
    frame:
      "pointer-events-none absolute inset-1.5 -z-10 rounded-md border border-border bg-frame",
    tierBanner:
      "font-display relative mx-auto rounded-b-md border-2 border-t-0 font-bold text-frame border-frame bg-background px-4 pt-0.5 pb-1 text-[11px] tracking-[0.25em] uppercase",
    name: "font-display truncate px-4 pt-2 text-center text-xl leading-tight",
    /** Fills the space between the name and the category row. */
    artBox: "mx-4 my-2 flex min-h-0 flex-1 items-center justify-center",
    seal: "flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-double",
    art: "max-h-full max-w-full object-contain select-none",
    sealInitial: "font-display select-none text-5xl",
    categoryRow:
      "relative mx-4 flex items-center gap-2 rounded-sm border border-border bg-background/60 px-2.5 py-1.5",
    categoryLabel: "text-xs tracking-widest text-secondary uppercase",
    traitRow:
      "group/trait relative mx-4 my-2 flex items-center gap-2 rounded-sm border border-border bg-background/60 px-2.5 py-1.5",
    traitLabel: "text-xs tracking-widest text-secondary uppercase",
    /** Hover-revealed description; sits above the row, inside the card frame. */
    traitTooltip:
      "pointer-events-none absolute inset-x-0 bottom-full z-10 mb-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm leading-snug text-secondary normal-case opacity-0 shadow-lg transition-opacity duration-150 group-hover/trait:opacity-100",
    banner:
      "relative mx-1.5 mt-auto mb-1.5 flex shrink-0 flex-col items-center rounded-b-md border border-border bg-background px-3 pt-1.5 pb-2",
    printed: "text-[10px] tracking-widest text-secondary uppercase",
    value: "font-display text-2xl leading-tight",
  },
})

/** Low-detail strip: one line of symbols and text. Hover reveals the full card. */
export const compactCard = tv({
  slots: {
    root: "relative flex h-10 w-full items-center gap-2.5 overflow-hidden rounded-md border border-border bg-surface pr-3 text-left shadow-sm",
    /** Tier-colored edge running down the strip's left side. */
    trim: "h-full w-1 shrink-0",
    tier: "font-display w-5 shrink-0 text-center text-xs tracking-widest",
    name: "min-w-0 flex-1 truncate text-sm leading-tight",
    traitIcon: "shrink-0 text-secondary",
    value: "shrink-0 text-sm leading-none font-semibold",
  },
})
