import { BID_INCREMENT } from "@collectors-crown/shared"
import { useState } from "react"
import { formatMoney } from "../../lib/format"
import { Button } from "../button"

interface BidControlsProps {
  minBid: number
  maxBid: number
  onBid: (amount: number) => void
  onPass: () => void
  passLabel?: string
}

/** −/+ stepper in $100 steps between the minimum bid and available cash. */
export function BidControls({ minBid, maxBid, onBid, onPass, passLabel = "Pass" }: BidControlsProps) {
  const [amount, setAmount] = useState(minBid)
  const canBid = minBid <= maxBid

  return (
    <div className="flex items-center gap-2">
      {canBid && (
        <>
          <Button
            variant="secondary"
            isDisabled={amount - BID_INCREMENT < minBid}
            onPress={() => setAmount(amount - BID_INCREMENT)}
            aria-label="Lower bid"
          >
            −
          </Button>
          <Button onPress={() => onBid(amount)}>Bid {formatMoney(amount)}</Button>
          <Button
            variant="secondary"
            isDisabled={amount + BID_INCREMENT > maxBid}
            onPress={() => setAmount(amount + BID_INCREMENT)}
            aria-label="Raise bid"
          >
            +
          </Button>
        </>
      )}
      <Button variant="secondary" onPress={onPass}>
        {passLabel}
      </Button>
    </div>
  )
}
