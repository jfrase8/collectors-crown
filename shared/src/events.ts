import type {
  GameId,
  GameStateSnapshot,
  LobbyId,
  LobbyState,
  LobbySummary,
  PlayerId,
  PlayerInfo,
} from "./types.js";

// Typed Socket.IO event maps, shared by client and server.
// Expanded once the game rules are defined.

export type LobbyJoinResult =
  | { ok: true; lobby: LobbyState; playerId: PlayerId }
  | { ok: false; error: string };

export interface ServerToClientEvents {
  /** Sent to sockets browsing the lobby list whenever any lobby changes. */
  "lobby:list": (lobbies: LobbySummary[]) => void;
  /** Sent to lobby members whenever their lobby changes. */
  "lobby:state": (state: LobbyState) => void;
  "game:state": (state: GameStateSnapshot) => void;
  "game:player_joined": (player: PlayerInfo) => void;
  "game:player_left": (playerId: PlayerId) => void;
  "game:turn_changed": (currentTurn: number, turnNumber: number) => void;
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
  "lobby:start": (ack: (res: { ok: true } | { ok: false; error: string }) => void) => void;
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
  lobbyId?: LobbyId;
}
