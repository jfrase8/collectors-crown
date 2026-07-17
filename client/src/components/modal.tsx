import {
  Dialog,
  Modal as AriaModal,
  ModalOverlay,
  type DialogProps,
} from "react-aria-components"
import { modalBox, modalDialog, modalOverlay } from "./modal.styles"

export function Modal({ children }: { children: DialogProps["children"] }) {
  return (
    <ModalOverlay className={modalOverlay()} isDismissable>
      <AriaModal className={modalBox()}>
        <Dialog className={modalDialog()}>{children}</Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}
