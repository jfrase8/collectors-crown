import type { GameAction, GameSnapshot } from "./game/types.js";
import type {
  GameId,
  LobbyId,
  LobbyState,
  LobbySummary,
  PlayerId,
} from "./types.js";

// Typed Socket.IO event maps, shared by client and server.

export type LobbyJoinResult =
  | { ok: true; lobby: LobbyState; playerId: PlayerId }
  | { ok: false; error: string };

export type Ack = (res: { ok: true } | { ok: false; error: string }) => void;

export interface ServerToClientEvents {
  /** Sent to sockets browsing the lobby list whenever any lobby changes. */
  "lobby:list": (lobbies: LobbySummary[]) => void;
  /** Sent to lobby members whenever their lobby changes. */
  "lobby:state": (state: LobbyState) => void;
  /** Full public game state, sent to game members after every action. */
  "game:state": (state: GameSnapshot) => void;
  "game:error": (message: string) => void;
}

export interface ClientToServerEvents {
  /** Subscribe to lobby-list updates; ack returns the current list. */
  "lobby:list": (ack: (lobbies: LobbySummary[]) => void) => void;
  "lobby:create": (
    lobbyName: string,
    playerName: string,
    ack: (res: LobbyJoinResult) => void,
  ) => void;
  "lobby:join": (
    lobbyId: LobbyId,
    playerName: string,
    ack: (res: LobbyJoinResult) => void,
  ) => void;
  "lobby:leave": () => void;
  /** Host only: starts the game for the lobby. */
  "lobby:start": (ack: Ack) => void;
  /** Perform a game action; state is broadcast via game:state on success. */
  "game:action": (action: GameAction, ack: Ack) => void;
  /** Re-fetch the current game state (e.g. after a reconnect). */
  "game:get_state": (ack: (state: GameSnapshot | null) => void) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  playerId?: PlayerId;
  gameId?: GameId;
  lobbyId?: LobbyId;
}
