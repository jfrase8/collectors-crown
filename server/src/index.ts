import { createServer } from "node:http";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@collectors-crown/shared";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { env } from "./env.js";
import { redis } from "./redis.js";
import { registerGameHandlers } from "./socket/game-handlers.js";

const app = express();
app.use(cors({ origin: env.clientOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const httpServer = createServer(app);

export type GameServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const io: GameServer = new Server(httpServer, {
  cors: { origin: env.clientOrigins },
});

io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);
  registerGameHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`[socket] disconnected: ${socket.id} (${reason})`);
  });
});

async function main() {
  try {
    await redis.connect();
  } catch (err) {
    console.warn(
      "[redis] could not connect — continuing without Redis:",
      err instanceof Error ? err.message : err,
    );
  }
  httpServer.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
