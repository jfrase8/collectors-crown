import {
  Input,
  Label,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components"
import { field, fieldInput, fieldLabel } from "./text-field.styles"

interface TextFieldProps extends Omit<AriaTextFieldProps, "className"> {
  label: string
}

export function TextField({ label, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className={field()}>
      <Label className={fieldLabel()}>{label}</Label>
      <Input className={fieldInput()} />
    </AriaTextField>
  )
}
