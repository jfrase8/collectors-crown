import {
  currentValue,
  type CollectibleId,
  type GameAction,
  type GameSnapshot,
  type PlayerId,
} from "@collectors-crown/shared"
import { useState } from "react"
import { formatMoney } from "../../lib/format"
import { Button } from "../button"
import { CardWithDetails } from "./card-with-details"

interface MarketPanelProps {
  game: GameSnapshot
  myPlayerId: PlayerId
  send: (action: GameAction) => void
}

export function MarketPanel({ game, myPlayerId, send }: MarketPanelProps) {
  const [selected, setSelected] = useState<CollectibleId[]>([])
  const me = game.players.find((p) => p.id === myPlayerId)
  if (!me) return null
  const done = game.marketDone.includes(myPlayerId)
  const waitingOn = game.players.filter((p) => !game.marketDone.includes(p.id))

  function toggle(id: CollectibleId) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  function confirm() {
    for (const id of selected) send({ type: "sell", collectibleId: id })
    send({ type: "market_done" })
    setSelected([])
  }

  const total = me.collection
    .filter((owned) => selected.includes(owned.id))
    .reduce((sum, owned) => sum + currentValue(owned, me, game.players), 0)

  return (
    <section className="flex flex-1 flex-col items-center gap-6 py-6">
      <div className="text-center">
        <h2 className="font-display text-2xl">The market is open</h2>
        <p className="text-secondary">
          Select the collectibles you want to sell at their current value, then
          confirm to finish the round.
        </p>
      </div>

      {me.collection.length === 0 ? (
        <p className="text-secondary italic">You own nothing to sell.</p>
      ) : (
        <ul className="flex w-full max-w-xl flex-col gap-2">
          {me.collection.map((owned) => {
            const value = currentValue(owned, me, game.players)
            return (
              <li key={owned.id}>
                <CardWithDetails
                  cardId={owned.id}
                  currentValue={value}
                  onPress={done ? undefined : () => toggle(owned.id)}
                  isSelected={selected.includes(owned.id)}
                />
              </li>
            )
          })}
        </ul>
      )}

      {done ? (
        <p className="text-secondary italic">
          Waiting on {waitingOn.map((p) => p.name).join(", ")}…
        </p>
      ) : (
        <Button onPress={confirm}>
          {selected.length === 0
            ? "Finish without selling"
            : `Sell ${selected.length} for ${formatMoney(total)} & finish`}
        </Button>
      )}
    </section>
  )
}
