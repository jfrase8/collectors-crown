import type { Tier } from "./types.js";

export const STARTING_CASH = 1000;
export const MIN_GAME_PLAYERS = 3;
export const MAX_GAME_PLAYERS = 5;

export const TOTAL_ROUNDS = 12;
export const ROUNDS_PER_TIER = 4;
/** Grand auctions happen on the last round of each tier. */
export const GRAND_AUCTION_ROUNDS = [4, 8, 12] as const;

export const MAX_PURCHASES_PER_AUCTION_PHASE = 2;
export const GRAND_AUCTION_BIDS_PER_PLAYER = 5;
export const BID_INCREMENT = 100;

/** Every tier-dependent number in the rules, in one table. */
export interface TierConfig {
  deckSize: number;
  printedValues: { min: number; max: number };
  /** Added to `currentAppreciation` each End of Round (Appreciation trait). */
  appreciationPerRound: number;
  /** Per owned collectible in the same category, including itself (Collection trait). */
  collectionBonusPerMatch: number;
  /** Per opponent owning zero Rare collectibles, final scoring only (Rarity trait). */
  rarityBonusPerOpponent: number;
  /** If the owner holds at least one collectible of the paired category (Pairing trait). */
  pairingBonus: number;
  /** Income granted during this tier's Income Phase. */
  income: number;
}

export const TIER_NAMES: Record<Tier, string> = {
  1: "Collector's Market",
  2: "Prestige Auction",
  3: "Elite Auction",
};

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  1: {
    deckSize: 30,
    printedValues: { min: 100, max: 300 },
    appreciationPerRound: 100,
    collectionBonusPerMatch: 100,
    rarityBonusPerOpponent: 100,
    pairingBonus: 200,
    income: 200,
  },
  2: {
    deckSize: 30,
    printedValues: { min: 500, max: 800 },
    appreciationPerRound: 300,
    collectionBonusPerMatch: 300,
    rarityBonusPerOpponent: 500,
    pairingBonus: 500,
    income: 500,
  },
  3: {
    deckSize: 30,
    printedValues: { min: 1000, max: 1200 },
    appreciationPerRound: 800,
    collectionBonusPerMatch: 500,
    rarityBonusPerOpponent: 2000,
    pairingBonus: 1000,
    income: 1000,
  },
};

export function tierForRound(round: number): Tier {
  if (round <= 4) return 1;
  if (round <= 8) return 2;
  return 3;
}

export function isGrandAuctionRound(round: number): boolean {
  return (GRAND_AUCTION_ROUNDS as readonly number[]).includes(round);
}

export function auctionRevealCount(playerCount: number): number {
  return playerCount * 2 - 2;
}
