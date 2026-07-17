import type { GameSnapshot, PlayerId } from "@collectors-crown/shared";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface GameStore {
  playerId: PlayerId | null;
  game: GameSnapshot | null;
  setPlayerId: (id: PlayerId) => void;
  setGame: (game: GameSnapshot) => void;
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
        // Ignore stale snapshots that can arrive out of order.
        if (state.game && game.version < state.game.version) return;
        state.game = game;
      }),
    reset: () =>
      set((state) => {
        state.playerId = null;
        state.game = null;
      }),
  })),
);
