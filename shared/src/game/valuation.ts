import { getCard } from "./cards.js";
import { TIER_CONFIG } from "./constants.js";
import type {
  CollectibleDefinition,
  CollectibleState,
  FinalScore,
  GamePlayer,
  GameState,
  TraitId,
} from "./types.js";

// All value calculation lives here. Values are always derived from current
// game state — never stored.
//
// Current Value = (printedValue + currentAppreciation + trait flat bonus)
//                 × trait multiplier
//
// Appreciation accrual is gated by the `appreciation` trait (see engine end
// of round), but the accumulated amount is added universally here so the
// formula stays uniform.

export interface ValuationContext {
  card: CollectibleDefinition;
  state: CollectibleState;
  owner: GamePlayer;
  allPlayers: readonly GamePlayer[];
}

interface TraitValuation {
  flatBonus?: (ctx: ValuationContext) => number;
  multiplier?: (ctx: ValuationContext) => number;
}

function countInCategory(owner: GamePlayer, category: string): number {
  return owner.collection.filter((c) => getCard(c.id).category === category).length;
}

/** Add new traits by adding an entry here — no engine changes needed. */
const TRAIT_VALUATIONS: Record<TraitId, TraitValuation> = {
  appreciation: {
    // Accrual happens at end of round; the accumulated value is added for
    // every card in currentValue below.
  },
  collection: {
    flatBonus: ({ card, owner }) =>
      TIER_CONFIG[card.tier].collectionBonusPerMatch * countInCategory(owner, card.category),
  },
  set: {
    multiplier: ({ card, owner }) =>
      owner.collection.filter((c) => getCard(c.id).setId === card.setId).length,
  },
  rarity: {
    flatBonus: ({ card, owner, allPlayers }) => {
      const opponentsWithoutRare = allPlayers.filter(
        (p) => p.id !== owner.id && !p.collection.some((c) => getCard(c.id).trait === "rarity"),
      ).length;
      return TIER_CONFIG[card.tier].rarityBonusPerOpponent * opponentsWithoutRare;
    },
  },
  pairing: {
    flatBonus: ({ card, owner }) =>
      card.pairedCategory && countInCategory(owner, card.pairedCategory) > 0
        ? TIER_CONFIG[card.tier].pairingBonus
        : 0,
  },
};

export function currentValue(
  state: CollectibleState,
  owner: GamePlayer,
  allPlayers: readonly GamePlayer[],
): number {
  const card = getCard(state.id);
  const ctx: ValuationContext = { card, state, owner, allPlayers };
  const valuation = TRAIT_VALUATIONS[card.trait];
  const flat = valuation.flatBonus?.(ctx) ?? 0;
  const multiplier = valuation.multiplier?.(ctx) ?? 1;
  return (card.printedValue + state.currentAppreciation + flat) * multiplier;
}

export function collectionValue(owner: GamePlayer, allPlayers: readonly GamePlayer[]): number {
  return owner.collection.reduce((sum, c) => sum + currentValue(c, owner, allPlayers), 0);
}

export function computeFinalScores(state: GameState): FinalScore[] {
  return state.players
    .map((p) => {
      const value = collectionValue(p, state.players);
      return { playerId: p.id, cash: p.cash, collectionValue: value, netWorth: p.cash + value };
    })
    .sort((a, b) => b.netWorth - a.netWorth);
}
