import type { GameSnapshot, PlayerId } from "@collectors-crown/shared"
import { formatMoney } from "../../lib/format"

interface ScoresPanelProps {
  game: GameSnapshot
  myPlayerId: PlayerId
}

export function ScoresPanel({ game, myPlayerId }: ScoresPanelProps) {
  if (!game.finalScores) return null

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
      <h2 className="font-display text-3xl">Final standings</h2>
      <ol className="flex w-full max-w-lg flex-col gap-2">
        {game.finalScores.map((score, rank) => {
          const player = game.players.find((p) => p.id === score.playerId)
          return (
            <li
              key={score.playerId}
              className={`flex items-baseline justify-between gap-4 rounded-lg border px-5 py-3 ${
                rank === 0 ? "border-primary/70 bg-primary/10" : "border-border bg-surface"
              }`}
            >
              <span className="font-medium">
                {rank === 0 && "👑 "}
                {player?.name}
                {score.playerId === myPlayerId && " (you)"}
              </span>
              <span className="text-right">
                <span className="font-display text-xl">{formatMoney(score.netWorth)}</span>
                <span className="block text-xs text-secondary/70">
                  {formatMoney(score.cash)} cash + {formatMoney(score.collectionValue)} collection
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
