import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@collectors-crown/shared";
import type { Server, Socket } from "socket.io";

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

// Game event handlers — implemented once the game rules are defined.
export function registerGameHandlers(_io: GameServer, socket: GameSocket) {
  socket.on("game:create", (_playerName, ack) => {
    ack({ gameId: "not-implemented", playerId: "not-implemented" });
  });

  socket.on("game:join", (_gameId, _playerName, ack) => {
    ack({ ok: false, error: "Not implemented yet" });
  });

  socket.on("game:end_turn", () => {
    socket.emit("game:error", "Not implemented yet");
  });
}
