import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"
import { button, type ButtonVariants } from "./button.styles"

interface ButtonProps extends Omit<AriaButtonProps, "className">, ButtonVariants {
  className?: string
}

export function Button({ variant, className, ...props }: ButtonProps) {
  return <AriaButton {...props} className={button({ variant, className })} />
}
