import type { GamePlayer, StandardLotResult } from "@collectors-crown/shared"
import { useEffect, useRef } from "react"
import { formatMoney } from "../../lib/format"
import { CardWithDetails } from "./card-with-details"

interface LotRailProps {
  results: StandardLotResult[]
  players: readonly GamePlayer[]
}

/** Already-auctioned lots slide off to the left as new ones are listed. */
export function LotRail({ results, players }: LotRailProps) {
  const railRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const rail = railRef.current
    if (rail) rail.scrollTo({ left: rail.scrollWidth, behavior: "smooth" })
  }, [results.length])

  if (results.length === 0) return null

  return (
    <ul ref={railRef} className="flex w-full gap-3 overflow-x-auto px-1 pb-2">
      {results.map((result) => {
        const winner = players.find((p) => p.id === result.winnerId)
        return (
          <li key={result.cardId} className="flex shrink-0 flex-col items-center gap-1">
            <CardWithDetails cardId={result.cardId} />
            <span className="text-xs text-secondary">
              {winner && result.price !== null
                ? `${winner.name} — ${formatMoney(result.price)}`
                : "Passed over"}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
