/**
 * Card artwork registry. PNGs live in client/public/images, named after the
 * card's slugified display name; list a slug here once its file exists and the
 * card swaps its seal placeholder for the art.
 */
const ART_SLUGS = new Set([
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
])

/** Path to the card's artwork, or undefined while it only has the placeholder. */
export function cardArt(name: string): string | undefined {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return ART_SLUGS.has(slug) ? `/images/${slug}.png` : undefined
}
