import type { Category } from "@collectors-crown/shared"

/**
 * Card artwork registry. PNGs live in client/public/images/cards/<category>,
 * named after the card's slugified display name; list a slug under its category
 * once the file exists and the card swaps its seal placeholder for the art.
 */
const ART_SLUGS: Partial<Record<Category, ReadonlySet<string>>> = {
  Coins: new Set([
    "1804-dollar",
    "1943-copper-cent",
    "athenian-owl",
    "brasher-doubloon",
    "buffalo-nickel",
    "double-eagle",
    "flowing-hair",
    "gold-florin",
    "gold-sovereign",
    "indian-head-cent",
    "persian-daric",
    "silver-dollar",
    "spanish-doubloon",
    "trade-dollar",
  ]),
  Comics: new Set([
    "captain-valor",
    "crimson-bolt",
    "eclipse-guardian",
    "emberstrike",
    "emerald-viper",
    "frost-fang",
    "infinity-paragon",
    "iron-warden",
    "nova-knight",
    "phantom-vanguard",
    "shadow-lynx",
    "solar-sentinel",
    "star-sovereign",
    "tempest-titan",
    "titan-prime",
  ]),
}

/** Path to the card's artwork, or undefined while it only has the placeholder. */
export function cardArt(name: string, category: Category): string | undefined {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  if (!ART_SLUGS[category]?.has(slug)) return undefined
  return `/images/cards/${category.toLowerCase()}/${slug}.png`
}
