import type { ReactNode } from "react"
import {
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components"
import { Button } from "../button"
import {
  drawerBody,
  drawerBox,
  drawerDialog,
  drawerHeader,
  drawerOverlay,
  drawerTitle,
  triggerBadge,
  triggerTooltip,
} from "./drawer.styles"
import { CloseIcon } from "./icons"

interface DrawerProps {
  /** Icon shown in the ghost trigger button. */
  icon: ReactNode
  /** Names the drawer: tooltip, accessible label, and panel heading. */
  title: string
  /** Optional count shown beside the icon. */
  badge?: number
  children: ReactNode
}

/** Right-hand slide-over panel; keeps the auction stage uncluttered. */
export function Drawer({ icon, title, badge, children }: DrawerProps) {
  return (
    <DialogTrigger>
      <TooltipTrigger delay={400}>
        <Button variant="ghost" aria-label={title}>
          <span className="flex items-center gap-1">
            {icon}
            {badge !== undefined && <span className={triggerBadge()}>{badge}</span>}
          </span>
        </Button>
        <Tooltip placement="top" offset={6} className={triggerTooltip()}>
          {title}
        </Tooltip>
      </TooltipTrigger>
      <ModalOverlay className={drawerOverlay()} isDismissable>
        <Modal className={drawerBox()}>
          <Dialog className={drawerDialog()}>
            {({ close }) => (
              <>
                <header className={drawerHeader()}>
                  <Heading slot="title" className={drawerTitle()}>
                    {title}
                  </Heading>
                  <Button variant="ghost" onPress={close} aria-label="Close">
                    <CloseIcon />
                  </Button>
                </header>
                <div className={drawerBody()}>{children}</div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
