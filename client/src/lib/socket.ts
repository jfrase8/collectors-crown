import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@collectors-crown/shared";
import { io, type Socket } from "socket.io-client";

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: GameSocket = io(
  import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001",
  {
    autoConnect: false,
    transports: ["websocket"],
  },
);
