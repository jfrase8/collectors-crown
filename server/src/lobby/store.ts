import {
  MAX_LOBBY_PLAYERS,
  type LobbyId,
  type LobbyState,
  type LobbySummary,
} from "@collectors-crown/shared";
import { redis } from "../redis.js";

// Live lobby state lives in Redis:
//   lobby:ids          — set of active lobby ids
//   lobby:names        — hash of lowercased lobby name → id (uniqueness)
//   lobby:data:{id}    — JSON-encoded LobbyState

const IDS_KEY = "lobby:ids";
const NAMES_KEY = "lobby:names";
const dataKey = (id: LobbyId) => `lobby:data:${id}`;

export async function getLobby(id: LobbyId): Promise<LobbyState | null> {
  const raw = await redis.get(dataKey(id));
  return raw ? (JSON.parse(raw) as LobbyState) : null;
}

export async function saveLobby(lobby: LobbyState): Promise<void> {
  await redis.set(dataKey(lobby.id), JSON.stringify(lobby));
}

/** Reserves the lobby name (case-insensitive). Returns false if taken. */
export async function reserveLobbyName(name: string, id: LobbyId): Promise<boolean> {
  const reserved = await redis.hsetnx(NAMES_KEY, name.toLowerCase(), id);
  if (reserved === 1) {
    await redis.sadd(IDS_KEY, id);
    return true;
  }
  return false;
}

export async function deleteLobby(lobby: LobbyState): Promise<void> {
  await redis
    .multi()
    .del(dataKey(lobby.id))
    .srem(IDS_KEY, lobby.id)
    .hdel(NAMES_KEY, lobby.name.toLowerCase())
    .exec();
}

export async function listLobbies(): Promise<LobbySummary[]> {
  const ids = await redis.smembers(IDS_KEY);
  if (ids.length === 0) return [];
  const raws = await redis.mget(ids.map(dataKey));
  const lobbies: LobbyState[] = [];
  for (const raw of raws) {
    if (raw) lobbies.push(JSON.parse(raw) as LobbyState);
  }
  return lobbies
    .map((l) => ({
      id: l.id,
      name: l.name,
      playerCount: l.players.length,
      maxPlayers: MAX_LOBBY_PLAYERS,
      phase: l.phase,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
