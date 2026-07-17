import { getCharacter, type GameSnapshot, type PlayerId } from "@collectors-crown/shared"
import { formatMoney } from "../../lib/format"
import { CollectionGrid } from "./collection-grid"

interface PlayersPanelProps {
  game: GameSnapshot
  myPlayerId: PlayerId
}

/** Drawer body: every player's cash and collection (all public). */
export function PlayersPanel({ game, myPlayerId }: PlayersPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {game.players.map((player) => (
        <section key={player.id} className="flex flex-col gap-2">
          <header className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-base">
              {player.name}
              {player.id === myPlayerId && " (you)"}
            </h3>
            <span className="text-sm text-secondary">
              {getCharacter(player.characterId).name} · {formatMoney(player.cash)}
            </span>
          </header>
          <CollectionGrid owner={player} allPlayers={game.players} />
        </section>
      ))}
    </div>
  )
}
