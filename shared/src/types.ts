// Core game types shared between client and server.
// Fleshed out once the game rules are defined.

export type PlayerId = string;
export type GameId = string;

export type GamePhase = "lobby" | "in_progress" | "finished";

export interface PlayerInfo {
  id: PlayerId;
  name: string;
  connected: boolean;
}

export type LobbyId = string;

export const MAX_LOBBY_PLAYERS = 4;
export const MIN_PLAYERS_TO_START = 3;
export const MAX_NAME_LENGTH = 24;

export type LobbyPhase = "waiting" | "in_progress";

/** Full lobby state, sent to lobby members. */
export interface LobbyState {
  id: LobbyId;
  name: string;
  hostId: PlayerId;
  phase: LobbyPhase;
  players: PlayerInfo[];
}

/** Compact lobby info, sent to clients browsing the lobby list. */
export interface LobbySummary {
  id: LobbyId;
  name: string;
  playerCount: number;
  maxPlayers: number;
  phase: LobbyPhase;
}

export interface GameStateSnapshot {
  gameId: GameId;
  phase: GamePhase;
  players: PlayerInfo[];
  /** Index into `players` of whose turn it is. */
  currentTurn: number;
  turnNumber: number;
}
