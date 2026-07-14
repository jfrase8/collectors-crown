import type { GameId, GameStateSnapshot, PlayerId, PlayerInfo } from "./types.js";

// Typed Socket.IO event maps, shared by client and server.
// Expanded once the game rules are defined.

export interface ServerToClientEvents {
  "game:state": (state: GameStateSnapshot) => void;
  "game:player_joined": (player: PlayerInfo) => void;
  "game:player_left": (playerId: PlayerId) => void;
  "game:turn_changed": (currentTurn: number, turnNumber: number) => void;
  "game:error": (message: string) => void;
}

export interface ClientToServerEvents {
  "game:create": (
    playerName: string,
    ack: (res: { gameId: GameId; playerId: PlayerId }) => void,
  ) => void;
  "game:join": (
    gameId: GameId,
    playerName: string,
    ack: (res: { ok: true; playerId: PlayerId } | { ok: false; error: string }) => void,
  ) => void;
  "game:end_turn": () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  playerId?: PlayerId;
  gameId?: GameId;
}
