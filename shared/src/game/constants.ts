import type { Tier } from "./types.js";

export const STARTING_CASH = 1000;
export const MIN_GAME_PLAYERS = 3;
export const MAX_GAME_PLAYERS = 5;

/** 3 players play 4 rounds per tier; 4–5 players play 3. */
export function roundsPerTier(playerCount: number): number {
  return playerCount === 3 ? 4 : 3;
}

export function totalRounds(playerCount: number): number {
  return roundsPerTier(playerCount) * 3;
}

export const MAX_PURCHASES_PER_AUCTION_PHASE = 2;
export const GRAND_AUCTION_BIDS_PER_PLAYER = 5;
export const BID_INCREMENT = 100;

/** Every tier-dependent number in the rules, in one table. */
export interface TierConfig {
  printedValues: { min: number; max: number };
  /** Added to `currentAppreciation` each End of Round (Appreciation trait). */
  appreciationPerRound: number;
  /** Per other owned collectible in the same category, excluding itself (Collection trait). */
  collectionBonusPerMatch: number;
  /** Per opponent owning zero Rare collectibles, applied live (Rarity trait). */
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
    printedValues: { min: 100, max: 300 },
    appreciationPerRound: 100,
    collectionBonusPerMatch: 100,
    rarityBonusPerOpponent: 100,
    pairingBonus: 200,
    income: 200,
  },
  2: {
    printedValues: { min: 500, max: 800 },
    appreciationPerRound: 300,
    collectionBonusPerMatch: 300,
    rarityBonusPerOpponent: 500,
    pairingBonus: 500,
    income: 500,
  },
  3: {
    printedValues: { min: 1000, max: 1200 },
    appreciationPerRound: 800,
    collectionBonusPerMatch: 500,
    rarityBonusPerOpponent: 2000,
    pairingBonus: 1000,
    income: 1000,
  },
};

export function tierForRound(round: number, playerCount: number): Tier {
  const perTier = roundsPerTier(playerCount);
  if (round <= perTier) return 1;
  if (round <= perTier * 2) return 2;
  return 3;
}

/** Grand auctions happen on the last round of each tier. */
export function isGrandAuctionRound(round: number, playerCount: number): boolean {
  return round % roundsPerTier(playerCount) === 0;
}

export function auctionRevealCount(playerCount: number): number {
  return playerCount * 2 - 2;
}

/**
 * Each tier's deck holds one set card per chosen set (one set per player)
 * plus random non-set fillers, sized so the deck is exactly consumed:
 * 3p → 3+13=16, 4p → 4+14=18, 5p → 5+19=24.
 */
export function tierDeckComposition(playerCount: number): {
  setCards: number;
  fillerCards: number;
} {
  const deckSize = auctionRevealCount(playerCount) * roundsPerTier(playerCount);
  return { setCards: playerCount, fillerCards: deckSize - playerCount };
}
