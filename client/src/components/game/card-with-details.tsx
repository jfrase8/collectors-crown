import type { CollectibleId } from "@collectors-crown/shared"
import {
  Button as AriaButton,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components"
import { CollectibleCard } from "./collectible-card"

interface CardWithDetailsProps {
  cardId: CollectibleId
  currentValue?: number
  /** Makes the strip clickable (e.g. toggling it for sale). */
  onPress?: () => void
  /** Highlights the strip as part of the current selection. */
  isSelected?: boolean
}

/** Low-detail card that reveals the full card on hover or focus. */
export function CardWithDetails({
  cardId,
  currentValue,
  onPress,
  isSelected = false,
}: CardWithDetailsProps) {
  return (
    <TooltipTrigger delay={250} closeDelay={100}>
      <AriaButton
        onPress={onPress}
        className={`w-full rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          onPress ? "cursor-pointer" : "cursor-default"
        } ${isSelected ? "ring-2 ring-primary" : ""}`}
      >
        <CollectibleCard
          cardId={cardId}
          size="sm"
          currentValue={currentValue}
        />
      </AriaButton>
      <Tooltip placement="left top" offset={10} className="z-20">
        <CollectibleCard
          cardId={cardId}
          size="lg"
          currentValue={currentValue}
        />
      </Tooltip>
    </TooltipTrigger>
  )
}
