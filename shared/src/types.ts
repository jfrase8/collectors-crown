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

export interface GameStateSnapshot {
  gameId: GameId;
  phase: GamePhase;
  players: PlayerInfo[];
  /** Index into `players` of whose turn it is. */
  currentTurn: number;
  turnNumber: number;
}
