import type { LobbyState, LobbySummary, PlayerId } from "@collectors-crown/shared";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface LobbyStore {
  playerId: PlayerId | null;
  lobby: LobbyState | null;
  lobbies: LobbySummary[];
  setJoined: (lobby: LobbyState, playerId: PlayerId) => void;
  setLobby: (lobby: LobbyState) => void;
  setLobbies: (lobbies: LobbySummary[]) => void;
  reset: () => void;
}

export const useLobbyStore = create<LobbyStore>()(
  immer((set) => ({
    playerId: null,
    lobby: null,
    lobbies: [],
    setJoined: (lobby, playerId) =>
      set((state) => {
        state.lobby = lobby;
        state.playerId = playerId;
      }),
    setLobby: (lobby) =>
      set((state) => {
        state.lobby = lobby;
      }),
    setLobbies: (lobbies) =>
      set((state) => {
        state.lobbies = lobbies;
      }),
    reset: () =>
      set((state) => {
        state.playerId = null;
        state.lobby = null;
      }),
  })),
);
