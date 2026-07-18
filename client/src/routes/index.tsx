import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { CreateLobbyDialog } from "../components/create-lobby-dialog"
import { LobbyListSkeleton } from "../components/lobby-list-skeleton"
import { LobbyRow } from "../components/lobby-row"
import { socket } from "../lib/socket"
import { useLobbyStore } from "../stores/lobby-store"

export const Route = createFileRoute("/")({
  component: LobbyBrowser,
})

function LobbyBrowser() {
  const lobbies = useLobbyStore((s) => s.lobbies)
  const setLobbies = useLobbyStore((s) => s.setLobbies)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    socket.emit("lobby:list", (list) => {
      setLobbies(list)
      setLoading(false)
    })
  }, [setLobbies])

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <img
          src="/images/logo-gradient.png"
          alt="Collectors Crown"
          className="h-32 w-32 object-contain"
        />
        <h1 className="text-4xl font-bold tracking-tight">Collectors Crown</h1>
        <p className="text-secondary">Join a lobby or create your own.</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lobbies</h2>
        <CreateLobbyDialog />
      </div>

      {loading ? (
        <LobbyListSkeleton />
      ) : lobbies.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-secondary">
          No lobbies yet. Create one to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lobbies.map((lobby) => (
            <LobbyRow key={lobby.id} lobby={lobby} />
          ))}
        </ul>
      )}
    </main>
  )
}
