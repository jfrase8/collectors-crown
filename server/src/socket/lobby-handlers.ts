import { randomUUID } from "node:crypto";
import {
  createGame,
  MAX_LOBBY_PLAYERS,
  MAX_NAME_LENGTH,
  MIN_PLAYERS_TO_START,
  toSnapshot,
  type ClientToServerEvents,
  type InterServerEvents,
  type LobbyState,
  type ServerToClientEvents,
  type SocketData,
} from "@collectors-crown/shared";
import type { Server, Socket } from "socket.io";
import { deleteGame, saveGame } from "../game/store.js";
import { deleteLobby, getLobby, listLobbies, reserveLobbyName, saveLobby } from "../lobby/store.js";

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

/** Room joined by sockets browsing the lobby list. */
const BROWSER_ROOM = "lobby-browsers";
const lobbyRoom = (lobbyId: string) => `lobby:${lobbyId}`;

function validateName(name: string, label: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return `${label} is required.`;
  if (trimmed.length > MAX_NAME_LENGTH)
    return `${label} must be at most ${MAX_NAME_LENGTH} characters.`;
  return null;
}

async function broadcastLobbyList(io: GameServer) {
  io.to(BROWSER_ROOM).emit("lobby:list", await listLobbies());
}

export function registerLobbyHandlers(io: GameServer, socket: GameSocket) {
  socket.on("lobby:list", async (ack) => {
    try {
      const lobbies = await listLobbies();
      await socket.join(BROWSER_ROOM);
      ack(lobbies);
    } catch (err) {
      console.error("[lobby] list failed:", err);
      ack([]);
    }
  });

  socket.on("lobby:create", async (lobbyName, playerName, ack) => {
    try {
      if (socket.data.lobbyId) {
        return ack({ ok: false, error: "You are already in a lobby." });
      }
      const nameError =
        validateName(lobbyName, "Lobby name") ?? validateName(playerName, "Your name");
      if (nameError) return ack({ ok: false, error: nameError });

      const lobby: LobbyState = {
        id: randomUUID(),
        name: lobbyName.trim(),
        hostId: randomUUID(),
        phase: "waiting",
        players: [],
      };
      const playerId = lobby.hostId;
      lobby.players.push({ id: playerId, name: playerName.trim(), connected: true });

      if (!(await reserveLobbyName(lobby.name, lobby.id))) {
        return ack({ ok: false, error: "A lobby with that name already exists." });
      }
      await saveLobby(lobby);

      socket.data.lobbyId = lobby.id;
      socket.data.playerId = playerId;
      await socket.leave(BROWSER_ROOM);
      await socket.join(lobbyRoom(lobby.id));

      ack({ ok: true, lobby, playerId });
      await broadcastLobbyList(io);
    } catch (err) {
      console.error("[lobby] create failed:", err);
      ack({ ok: false, error: "Could not create the lobby. Try again." });
    }
  });

  socket.on("lobby:join", async (lobbyId, playerName, ack) => {
    try {
      if (socket.data.lobbyId) {
        return ack({ ok: false, error: "You are already in a lobby." });
      }
      const nameError = validateName(playerName, "Your name");
      if (nameError) return ack({ ok: false, error: nameError });

      const lobby = await getLobby(lobbyId);
      if (!lobby) return ack({ ok: false, error: "That lobby no longer exists." });
      if (lobby.phase !== "waiting")
        return ack({ ok: false, error: "That game has already started." });
      if (lobby.players.length >= MAX_LOBBY_PLAYERS)
        return ack({ ok: false, error: "That lobby is full." });

      const name = playerName.trim();
      if (lobby.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        return ack({ ok: false, error: "Someone in that lobby already has that name." });
      }

      const playerId = randomUUID();
      lobby.players.push({ id: playerId, name, connected: true });
      await saveLobby(lobby);

      socket.data.lobbyId = lobby.id;
      socket.data.playerId = playerId;
      await socket.leave(BROWSER_ROOM);
      await socket.join(lobbyRoom(lobby.id));

      ack({ ok: true, lobby, playerId });
      io.to(lobbyRoom(lobby.id)).emit("lobby:state", lobby);
      await broadcastLobbyList(io);
    } catch (err) {
      console.error("[lobby] join failed:", err);
      ack({ ok: false, error: "Could not join the lobby. Try again." });
    }
  });

  socket.on("lobby:start", async (ack) => {
    try {
      const { lobbyId, playerId } = socket.data;
      if (!lobbyId || !playerId) return ack({ ok: false, error: "You are not in a lobby." });

      const lobby = await getLobby(lobbyId);
      if (!lobby) return ack({ ok: false, error: "That lobby no longer exists." });
      if (lobby.hostId !== playerId)
        return ack({ ok: false, error: "Only the host can start the game." });
      if (lobby.players.length < MIN_PLAYERS_TO_START)
        return ack({
          ok: false,
          error: `Need at least ${MIN_PLAYERS_TO_START} players to start.`,
        });
      if (lobby.phase !== "waiting")
        return ack({ ok: false, error: "The game has already started." });

      // The game id is the lobby id; the game reuses the lobby's socket room.
      const game = createGame(
        lobby.id,
        lobby.players.map((p) => ({ id: p.id, name: p.name })),
        Date.now() >>> 0,
      );
      await saveGame(game);

      lobby.phase = "in_progress";
      await saveLobby(lobby);

      ack({ ok: true });
      io.to(lobbyRoom(lobby.id)).emit("lobby:state", lobby);
      io.to(lobbyRoom(lobby.id)).emit("game:state", toSnapshot(game));
      await broadcastLobbyList(io);
    } catch (err) {
      console.error("[lobby] start failed:", err);
      ack({ ok: false, error: "Could not start the game. Try again." });
    }
  });

  socket.on("lobby:leave", () => {
    void leaveCurrentLobby(io, socket);
  });

  socket.on("disconnect", () => {
    void leaveCurrentLobby(io, socket);
  });
}

async function leaveCurrentLobby(io: GameServer, socket: GameSocket) {
  const { lobbyId, playerId } = socket.data;
  if (!lobbyId || !playerId) return;
  socket.data.lobbyId = undefined;
  socket.data.playerId = undefined;
  await socket.leave(lobbyRoom(lobbyId));

  try {
    const lobby = await getLobby(lobbyId);
    if (!lobby) return;

    // Disconnect = kicked, regardless of phase (reconnect flow not implemented yet).
    lobby.players = lobby.players.filter((p) => p.id !== playerId);

    if (lobby.players.length === 0) {
      await deleteLobby(lobby);
      if (lobby.phase === "in_progress") await deleteGame(lobby.id);
    } else {
      if (lobby.hostId === playerId) {
        // Longest-present remaining player becomes the new host.
        lobby.hostId = lobby.players[0].id;
      }
      await saveLobby(lobby);
      io.to(lobbyRoom(lobby.id)).emit("lobby:state", lobby);
    }
    await broadcastLobbyList(io);
  } catch (err) {
    console.error("[lobby] leave failed:", err);
  }
}
