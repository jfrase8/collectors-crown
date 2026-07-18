import {
  currentValue,
  type GameAction,
  type GameSnapshot,
  type PlayerId,
} from "@collectors-crown/shared"
import { formatMoney } from "../../lib/format"
import { Button } from "../button"
import { CardWithDetails } from "./card-with-details"

interface MarketPanelProps {
  game: GameSnapshot
  myPlayerId: PlayerId
  send: (action: GameAction) => void
}

export function MarketPanel({ game, myPlayerId, send }: MarketPanelProps) {
  const me = game.players.find((p) => p.id === myPlayerId)
  if (!me) return null
  const done = game.marketDone.includes(myPlayerId)
  const waitingOn = game.players.filter((p) => !game.marketDone.includes(p.id))

  return (
    <section className="flex flex-1 flex-col items-center gap-6 py-6">
      <div className="text-center">
        <h2 className="font-display text-2xl">The market is open</h2>
        <p className="text-secondary">
          Sell any of your collectibles at their current value, then finish the round.
        </p>
      </div>

      {me.collection.length === 0 ? (
        <p className="text-secondary italic">You own nothing to sell.</p>
      ) : (
        <ul className="flex max-w-4xl flex-wrap justify-center gap-4">
          {me.collection.map((owned) => {
            const value = currentValue(owned, me, game.players)
            return (
              <li key={owned.id} className="flex flex-col items-center gap-2">
                <CardWithDetails cardId={owned.id} currentValue={value} />
                {!done && (
                  <Button
                    variant="secondary"
                    onPress={() => send({ type: "sell", collectibleId: owned.id })}
                  >
                    Sell for {formatMoney(value)}
                  </Button>
                )}
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
        <Button onPress={() => send({ type: "market_done" })}>Done selling</Button>
      )}
    </section>
  )
}
