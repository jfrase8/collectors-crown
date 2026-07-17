import {
  applyAction,
  toSnapshot,
  type ClientToServerEvents,
  type InterServerEvents,
  type ServerToClientEvents,
  type SocketData,
} from "@collectors-crown/shared";
import type { Server, Socket } from "socket.io";
import { getGame, saveGame, withGameLock } from "../game/store.js";

type GameServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type GameSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/** Games share their room with the lobby they were started from. */
const gameRoom = (gameId: string) => `lobby:${gameId}`;

export function registerGameHandlers(io: GameServer, socket: GameSocket) {
  socket.on("game:action", async (action, ack) => {
    const { lobbyId: gameId, playerId } = socket.data;
    if (!gameId || !playerId) return ack({ ok: false, error: "You are not in a game." });

    try {
      await withGameLock(gameId, async () => {
        const state = await getGame(gameId);
        if (!state) return ack({ ok: false, error: "That game no longer exists." });

        const result = applyAction(state, playerId, action);
        if (!result.ok) return ack(result);

        await saveGame(result.state);
        ack({ ok: true });
        io.to(gameRoom(gameId)).emit("game:state", toSnapshot(result.state));
      });
    } catch (err) {
      console.error("[game] action failed:", err);
      ack({ ok: false, error: "Could not perform that action. Try again." });
    }
  });

  socket.on("game:get_state", async (ack) => {
    const { lobbyId: gameId } = socket.data;
    if (!gameId) return ack(null);
    try {
      const state = await getGame(gameId);
      ack(state ? toSnapshot(state) : null);
    } catch (err) {
      console.error("[game] get_state failed:", err);
      ack(null);
    }
  });
}
