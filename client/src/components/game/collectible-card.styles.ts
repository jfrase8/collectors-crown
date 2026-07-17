import { tv } from "tailwind-variants"

export const card = tv({
  slots: {
    root: "relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface text-left shadow-lg",
    trim: "h-1 w-full shrink-0",
    header: "flex items-baseline justify-between gap-2 px-3 pt-2",
    tier: "font-display text-xs tracking-widest",
    category: "text-xs tracking-wide text-secondary/80 uppercase",
    seal: "mx-auto my-3 flex size-24 items-center justify-center rounded-full border-4 border-double",
    sealInitial: "font-display select-none text-5xl",
    name: "font-display px-3 leading-tight text-balance",
    traitName: "px-3 pt-2 text-xs font-semibold tracking-widest text-primary uppercase",
    trait: "px-3 pt-0.5 text-sm text-secondary/90",
    history: "px-3 pt-2 text-xs text-secondary/60 italic",
    footer: "mt-auto flex items-end justify-between gap-2 px-3 pt-3 pb-2",
    printed: "text-xs text-secondary/70",
    value: "text-right leading-none font-semibold",
  },
  variants: {
    size: {
      /** Full detail: everything there is to know about the card. */
      lg: {
        root: "w-64 min-h-80",
        name: "pt-1 text-center text-xl",
        value: "text-lg",
      },
      /** Low detail: name, category, and price. Hover for the full card. */
      sm: {
        root: "w-36 min-h-24",
        seal: "hidden",
        traitName: "hidden",
        trait: "hidden",
        history: "hidden",
        printed: "hidden",
        name: "pt-1 text-sm",
        value: "text-sm",
      },
    },
  },
  defaultVariants: {
    size: "lg",
  },
})
