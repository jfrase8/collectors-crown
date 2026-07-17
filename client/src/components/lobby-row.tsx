import type { LobbySummary } from "@collectors-crown/shared"
import { JoinLobbyDialog } from "./join-lobby-dialog"
import { row, rowMeta, rowName } from "./lobby-row.styles"

export function LobbyRow({ lobby }: { lobby: LobbySummary }) {
  const inProgress = lobby.phase === "in_progress"
  const full = lobby.playerCount >= lobby.maxPlayers
  return (
    <li className={row()}>
      <div className="min-w-0">
        <p className={rowName()}>{lobby.name}</p>
        <p className={rowMeta()}>
          {lobby.playerCount}/{lobby.maxPlayers} players
          {inProgress && " · in progress"}
          {!inProgress && full && " · full"}
        </p>
      </div>
      <JoinLobbyDialog lobby={lobby} disabled={inProgress || full} />
    </li>
  )
}
