import type { GameSnapshot, PlayerId } from "@collectors-crown/shared"
import { formatMoney } from "../../lib/format"
import { plaque, plaqueMeta, plaqueName, ribbon } from "./turn-ribbon.styles"

interface TurnRibbonProps {
  game: GameSnapshot
  myPlayerId: PlayerId
}

/** One plaque per player: cash and card count are public information. */
export function TurnRibbon({ game, myPlayerId }: TurnRibbonProps) {
  const auction = game.auction
  const activeSeat = game.phase === "auction" && auction ? auction.turnSeat : null
  const passed =
    auction?.kind === "standard" ? auction.passed : (auction?.kind === "grand" ? auction.passed : [])

  return (
    <ul className={ribbon()}>
      {game.players.map((player, seat) => {
        const isActive = seat === activeSeat
        const hasPassed = passed.includes(player.id)
        const isDoneSelling = game.phase === "market" && game.marketDone.includes(player.id)
        return (
          <li
            key={player.id}
            className={plaque({ active: isActive, dimmed: hasPassed || isDoneSelling })}
          >
            <span className={plaqueName({ active: isActive })}>
              {player.name}
              {player.id === myPlayerId && " (you)"}
            </span>
            <span className={plaqueMeta()}>{formatMoney(player.cash)}</span>
            <span className={plaqueMeta()}>
              {player.collection.length} card{player.collection.length === 1 ? "" : "s"}
            </span>
            {auction?.kind === "grand" && (
              <span className={plaqueMeta()}>
                {auction.bidsRemaining[player.id] ?? 0} bid
                {(auction.bidsRemaining[player.id] ?? 0) === 1 ? "" : "s"}
              </span>
            )}
            {!player.connected && <span title="Disconnected">🔌</span>}
          </li>
        )
      })}
    </ul>
  )
}
