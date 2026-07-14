import type { GameStateSnapshot, PlayerId } from "@collectors-crown/shared";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface GameStore {
  playerId: PlayerId | null;
  game: GameStateSnapshot | null;
  setPlayerId: (id: PlayerId) => void;
  setGame: (game: GameStateSnapshot) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    playerId: null,
    game: null,
    setPlayerId: (id) =>
      set((state) => {
        state.playerId = id;
      }),
    setGame: (game) =>
      set((state) => {
        state.game = game;
      }),
    reset: () =>
      set((state) => {
        state.playerId = null;
        state.game = null;
      }),
  })),
);
