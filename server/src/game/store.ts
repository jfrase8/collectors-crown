import type { GameId, GameState } from "@collectors-crown/shared";
import { redis } from "../redis.js";

// Live game state lives in Redis: game:data:{id} — JSON-encoded GameState.
// The game id is the lobby id the game was started from.

const dataKey = (id: GameId) => `game:data:${id}`;

export async function getGame(id: GameId): Promise<GameState | null> {
  const raw = await redis.get(dataKey(id));
  return raw ? (JSON.parse(raw) as GameState) : null;
}

export async function saveGame(state: GameState): Promise<void> {
  await redis.set(dataKey(state.gameId), JSON.stringify(state));
}

export async function deleteGame(id: GameId): Promise<void> {
  await redis.del(dataKey(id));
}

// Per-game action serialization (single-instance server). Prevents two
// concurrent socket events from applying actions to the same stale state.
const locks = new Map<GameId, Promise<unknown>>();

export function withGameLock<T>(id: GameId, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(id) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(
    id,
    next.catch(() => {}),
  );
  return next;
}
