import { tv, type VariantProps } from "tailwind-variants"

export const button = tv({
  base: "cursor-pointer transition-colors duration-200 rounded-md px-4 py-2 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    variant: {
      primary:
        "bg-primary font-semibold text-on-primary hover:bg-primary-hover focus-visible:ring-primary",
      secondary:
        "border border-border text-secondary hover:bg-border focus-visible:ring-secondary",
      /** Icon-only: no padding box, border, or background — just color change. */
      ghost:
        "rounded p-1 text-secondary hover:text-primary focus-visible:ring-primary",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})

export type ButtonVariants = VariantProps<typeof button>
