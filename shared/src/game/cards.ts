import { TIER_CONFIG } from "./constants.js"
import type {
  Category,
  CollectibleDefinition,
  CollectibleId,
  Tier,
  TraitId,
} from "./types.js"

// Placeholder card catalog: 30 cards per tier, 6 categories × 5 cards.
// Per tier each category gets one card of each trait (appreciation,
// collection, set, rarity, pairing), so traits and categories are evenly
// distributed. Each category's set cards across Tiers 1/2/3 form one named
// 3-card set (6 sets total). All names, values, and descriptions are generic
// filler until real card data exists.

export const CATEGORIES: readonly Category[] = [
  "Coins",
  "Stamps",
  "Paintings",
  "Watches",
  "Comics",
  "Relics",
]

const TRAITS: readonly TraitId[] = [
  "appreciation",
  "collection",
  "set",
  "rarity",
  "pairing",
]

/** Display names for the 3-card sets; one per category, spanning all tiers. */
export const SET_NAMES: Record<Category, string> = {
  Coins: "Minted Legends",
  Stamps: "Postal Pioneers",
  Paintings: "Gallery Masters",
  Watches: "Timekeepers",
  Comics: "Hero Sagas",
  Relics: "Lost Empires",
}

const TIER_LABEL: Record<Tier, string> = {
  1: "Curious",
  2: "Prestigious",
  3: "Legendary",
}

// Unique display names, kept short enough to fit on one line of the card.
// Indexed [tier][category][trait].
const CARD_NAMES: Record<Tier, Record<Category, Record<TraitId, string>>> = {
  1: {
    Coins: {
      appreciation: "Buffalo Nickel",
      collection: "Silver Dollar",
      set: "Indian Head Cent",
      rarity: "1943 Copper Cent",
      pairing: "Trade Dollar",
    },
    Stamps: {
      appreciation: "Penny Red",
      collection: "Columbian Issue",
      set: "Zeppelin Post",
      rarity: "Inverted Swan",
      pairing: "Pony Express",
    },
    Paintings: {
      appreciation: "Morning at Willow Bridge",
      collection: "Garden in Bloom",
      set: "Autumn at Briar Lake",
      rarity: "Blue Heron's Song",
      pairing: "Lanterns After Rain",
    },
    Watches: {
      appreciation: "Conductor's Watch",
      collection: "Silver Hunter",
      set: "Trench Watch",
      rarity: "Skeleton Dial",
      pairing: "Railroad Watch",
    },
    Comics: {
      appreciation: "Shadow Lynx",
      collection: "Crimson Bolt",
      set: "Frost Fang",
      rarity: "Emberstrike",
      pairing: "Emerald Viper",
    },
    Relics: {
      appreciation: "Bronze Amulet",
      collection: "Clay Tablet",
      set: "Temple Shards",
      rarity: "Sealed Urn",
      pairing: "Pilgrim's Token",
    },
  },
  2: {
    Coins: {
      appreciation: "Gold Sovereign",
      collection: "Double Eagle",
      set: "Spanish Doubloon",
      rarity: "1804 Dollar",
      pairing: "Gold Florin",
    },
    Stamps: {
      appreciation: "Penny Black",
      collection: "Basel Dove",
      set: "Missionary Stamp",
      rarity: "Inverted Jenny",
      pairing: "Perot Provisional",
    },
    Paintings: {
      appreciation: "Crimson Observatory",
      collection: "The Silent Cartographer",
      set: "Veil of the Silver Queen",
      rarity: "Ashes of the Phoenix King",
      pairing: "Echoes Beneath Ivory Skies",
    },
    Watches: {
      appreciation: "Gold Chronometer",
      collection: "Minute Repeater",
      set: "Officer's Watch",
      rarity: "Enamel Dial",
      pairing: "Marine Deck Watch",
    },
    Comics: {
      appreciation: "Nova Knight",
      collection: "Iron Warden",
      set: "Phantom Vanguard",
      rarity: "Tempest Titan",
      pairing: "Captain Valor",
    },
    Relics: {
      appreciation: "Jade Seal",
      collection: "Runestone",
      set: "Mosaic Panels",
      rarity: "Oracle Bones",
      pairing: "Crusader's Ring",
    },
  },
  3: {
    Coins: {
      appreciation: "Athenian Owl",
      collection: "Roman Aureus",
      set: "Brasher Doubloon",
      rarity: "Flowing Hair",
      pairing: "Persian Daric",
    },
    Stamps: {
      appreciation: "Blue Mauritius",
      collection: "Red Mercury",
      set: "Tre Skilling",
      rarity: "British Guiana",
      pairing: "Z Grill",
    },
    Paintings: {
      appreciation: "Ninth Horizon",
      collection: "Last Color",
      set: "Whispers Beyond Creation",
      rarity: "Crown of Eternity",
      pairing: "Final Dawn",
    },
    Watches: {
      appreciation: "Perpetual Calendar",
      collection: "Tourbillon",
      set: "Observatory Trial",
      rarity: "Grand Complication",
      pairing: "Sultan's Watch",
    },
    Comics: {
      appreciation: "Titan Prime",
      collection: "Solar Sentinel",
      set: "Star Sovereign",
      rarity: "Eclipse Guardian",
      pairing: "Infinity Paragon",
    },
    Relics: {
      appreciation: "Pharaoh's Mask",
      collection: "Terracotta Guard",
      set: "Crown Jewels",
      rarity: "Antikythera Gear",
      pairing: "Grail Fragment",
    },
  },
}

function traitDescription(
  trait: TraitId,
  tier: Tier,
  pairedCategory?: Category,
): string {
  const cfg = TIER_CONFIG[tier]
  switch (trait) {
    case "appreciation":
      return `Gains $${cfg.appreciationPerRound} in value at the end of every round.`
    case "collection":
      return `Gains $${cfg.collectionBonusPerMatch} for each other collectible you own in its category.`
    case "set":
      return "Part of a 3-card set. Value is multiplied by the number of set cards you own."
    case "rarity":
      return `Gains $${cfg.rarityBonusPerOpponent} for every opponent who owns zero Rare collectibles.`
    case "pairing":
      return `Gains $${cfg.pairingBonus} if you own at least one ${pairedCategory} collectible.`
  }
}

function buildCatalog(): CollectibleDefinition[] {
  const cards: CollectibleDefinition[] = []
  for (const tier of [1, 2, 3] as const) {
    const { min, max } = TIER_CONFIG[tier].printedValues
    const steps = (max - min) / 100 + 1
    let indexInTier = 0
    for (const category of CATEGORIES) {
      for (const trait of TRAITS) {
        const id: CollectibleId = `t${tier}-${category.toLowerCase()}-${trait}`
        // Spread printed values evenly across the tier's allowed range.
        const printedValue = min + (indexInTier % steps) * 100
        // Pair each category with the next one in the list.
        const pairedCategory =
          trait === "pairing"
            ? CATEGORIES[(CATEGORIES.indexOf(category) + 1) % CATEGORIES.length]
            : undefined
        // One set per category, spanning tiers: its set cards from
        // Tiers 1, 2, and 3 belong together.
        const setId =
          trait === "set" ? `set-${category.toLowerCase()}` : undefined
        cards.push({
          id,
          name: CARD_NAMES[tier][category][trait],
          tier,
          category,
          trait,
          printedValue,
          historicalDescription: `A placeholder ${category.toLowerCase()} artifact from the ${TIER_LABEL[tier].toLowerCase()} era.`,
          traitDescription: traitDescription(trait, tier, pairedCategory),
          ...(setId ? { setId, setName: SET_NAMES[category] } : {}),
          ...(pairedCategory ? { pairedCategory } : {}),
        })
        indexInTier++
      }
    }
  }
  return cards
}

export const CARD_CATALOG: readonly CollectibleDefinition[] = buildCatalog()

const catalogById = new Map(CARD_CATALOG.map((c) => [c.id, c]))

export function getCard(id: CollectibleId): CollectibleDefinition {
  const card = catalogById.get(id)
  if (!card) throw new Error(`Unknown collectible id: ${id}`)
  return card
}

export function cardsForTier(tier: Tier): CollectibleDefinition[] {
  return CARD_CATALOG.filter((c) => c.tier === tier)
}
