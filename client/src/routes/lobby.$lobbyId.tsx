import { MAX_LOBBY_PLAYERS, MIN_PLAYERS_TO_START } from "@collectors-crown/shared";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "react-aria-components";
import { socket } from "../lib/socket";
import { useLobbyStore } from "../stores/lobby-store";

export const Route = createFileRoute("/lobby/$lobbyId")({
  component: LobbyPage,
});

const primaryButtonClass =
  "rounded-md bg-amber-500 px-4 py-2 font-semibold text-neutral-950 outline-none hover:bg-amber-400 focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClass =
  "rounded-md border border-neutral-700 px-4 py-2 text-neutral-300 outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-500";

function LobbyPage() {
  const { lobbyId } = Route.useParams();
  const navigate = useNavigate();
  const lobby = useLobbyStore((s) => s.lobby);
  const playerId = useLobbyStore((s) => s.playerId);
  const reset = useLobbyStore((s) => s.reset);
  const [error, setError] = useState<string | null>(null);

  if (!lobby || lobby.id !== lobbyId || !playerId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-neutral-400">You are not in this lobby.</p>
        <Link to="/" className="text-amber-400 underline">
          Back to lobbies
        </Link>
      </main>
    );
  }

  const isHost = lobby.hostId === playerId;
  const canStart = lobby.players.length >= MIN_PLAYERS_TO_START;

  function leave() {
    socket.emit("lobby:leave");
    reset();
    void navigate({ to: "/" });
  }

  function start() {
    setError(null);
    socket.emit("lobby:start", (res) => {
      if (!res.ok) setError(res.error);
    });
  }

  if (lobby.phase === "in_progress") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Game started!</h1>
        <p className="text-neutral-400">The game screen is coming soon.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{lobby.name}</h1>
          <p className="text-neutral-400">Waiting for players…</p>
        </div>
        <Button className={secondaryButtonClass} onPress={leave}>
          Leave
        </Button>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Players ({lobby.players.length}/{MAX_LOBBY_PLAYERS})</h2>
        <ul className="flex flex-col gap-2">
          {lobby.players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3"
            >
              <span className="font-medium">
                {player.name}
                {player.id === playerId && (
                  <span className="ml-2 text-sm text-neutral-500">(you)</span>
                )}
              </span>
              {player.id === lobby.hostId && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-sm text-amber-400">
                  👑 Host
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isHost ? (
        <div className="flex flex-col items-center gap-2">
          <Button className={primaryButtonClass} isDisabled={!canStart} onPress={start}>
            Start Game
          </Button>
          {!canStart && (
            <p className="text-sm text-neutral-500">
              Need at least {MIN_PLAYERS_TO_START} players to start.
            </p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      ) : (
        <p className="text-center text-neutral-500">
          Waiting for the host to start the game…
        </p>
      )}
    </main>
  );
}
