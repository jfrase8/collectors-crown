import type { CollectibleId } from "@collectors-crown/shared"
import { Button as AriaButton, Tooltip, TooltipTrigger } from "react-aria-components"
import { CollectibleCard } from "./collectible-card"

interface CardWithDetailsProps {
  cardId: CollectibleId
  currentValue?: number
}

/** Low-detail card that reveals the full card on hover or focus. */
export function CardWithDetails({ cardId, currentValue }: CardWithDetailsProps) {
  return (
    <TooltipTrigger delay={250} closeDelay={100}>
      <AriaButton className="cursor-default rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <CollectibleCard cardId={cardId} size="sm" currentValue={currentValue} />
      </AriaButton>
      <Tooltip placement="top" offset={10} className="z-20">
        <CollectibleCard cardId={cardId} size="lg" currentValue={currentValue} />
      </Tooltip>
    </TooltipTrigger>
  )
}
