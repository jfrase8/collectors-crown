import { TIER_CONFIG } from "./constants.js";
import type {
  Category,
  CollectibleDefinition,
  CollectibleId,
  Tier,
  TraitId,
} from "./types.js";

// Placeholder card catalog: 30 cards per tier, 6 categories × 5 cards.
// Per tier each category gets one card of each trait (appreciation,
// collection, set, rarity, pairing), so traits and categories are evenly
// distributed. Set cards form two 3-card sets per tier. All names, values,
// and descriptions are generic filler until real card data exists.

export const CATEGORIES: readonly Category[] = [
  "Coins",
  "Stamps",
  "Paintings",
  "Watches",
  "Comics",
  "Relics",
];

const TRAITS: readonly TraitId[] = ["appreciation", "collection", "set", "rarity", "pairing"];

const TIER_LABEL: Record<Tier, string> = { 1: "Curious", 2: "Prestigious", 3: "Legendary" };

function traitDescription(trait: TraitId, tier: Tier, pairedCategory?: Category): string {
  const cfg = TIER_CONFIG[tier];
  switch (trait) {
    case "appreciation":
      return `Gains $${cfg.appreciationPerRound} in value at the end of every round.`;
    case "collection":
      return `Gains $${cfg.collectionBonusPerMatch} for each collectible you own in its category (including itself).`;
    case "set":
      return "Part of a 3-card set. Value is multiplied by the number of set cards you own.";
    case "rarity":
      return `At final scoring, gains $${cfg.rarityBonusPerOpponent} for every opponent who owns zero Rare collectibles.`;
    case "pairing":
      return `Gains $${cfg.pairingBonus} if you own at least one ${pairedCategory} collectible.`;
  }
}

function buildCatalog(): CollectibleDefinition[] {
  const cards: CollectibleDefinition[] = [];
  for (const tier of [1, 2, 3] as const) {
    const { min, max } = TIER_CONFIG[tier].printedValues;
    const steps = (max - min) / 100 + 1;
    let indexInTier = 0;
    for (const category of CATEGORIES) {
      for (const trait of TRAITS) {
        const id: CollectibleId = `t${tier}-${category.toLowerCase()}-${trait}`;
        // Spread printed values evenly across the tier's allowed range.
        const printedValue = min + (indexInTier % steps) * 100;
        // Pair each category with the next one in the list.
        const pairedCategory =
          trait === "pairing"
            ? CATEGORIES[(CATEGORIES.indexOf(category) + 1) % CATEGORIES.length]
            : undefined;
        // Two 3-card sets per tier: categories 0-2 form set A, 3-5 set B.
        const setId =
          trait === "set"
            ? `t${tier}-set-${CATEGORIES.indexOf(category) < 3 ? "a" : "b"}`
            : undefined;
        cards.push({
          id,
          name: `${TIER_LABEL[tier]} ${category.replace(/s$/, "")} of ${trait[0].toUpperCase()}${trait.slice(1)}`,
          tier,
          category,
          trait,
          printedValue,
          historicalDescription: `A placeholder ${category.toLowerCase()} artifact from the ${TIER_LABEL[tier].toLowerCase()} era.`,
          traitDescription: traitDescription(trait, tier, pairedCategory),
          ...(setId ? { setId } : {}),
          ...(pairedCategory ? { pairedCategory } : {}),
        });
        indexInTier++;
      }
    }
  }
  return cards;
}

export const CARD_CATALOG: readonly CollectibleDefinition[] = buildCatalog();

const catalogById = new Map(CARD_CATALOG.map((c) => [c.id, c]));

export function getCard(id: CollectibleId): CollectibleDefinition {
  const card = catalogById.get(id);
  if (!card) throw new Error(`Unknown collectible id: ${id}`);
  return card;
}

export function cardsForTier(tier: Tier): CollectibleDefinition[] {
  return CARD_CATALOG.filter((c) => c.tier === tier);
}
