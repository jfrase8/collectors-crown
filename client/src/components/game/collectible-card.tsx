import { getCard, type Category, type CollectibleId, type Tier } from "@collectors-crown/shared"
import { formatMoney } from "../../lib/format"
import { card } from "./collectible-card.styles"

const TIER_NUMERAL: Record<Tier, string> = { 1: "I", 2: "II", 3: "III" }

const TIER_COLOR: Record<Tier, string> = {
  1: "var(--color-tier1)",
  2: "var(--color-tier2)",
  3: "var(--color-tier3)",
}

/** Engraved-seal tint standing in for artwork until cards have art. */
const CATEGORY_HUE: Record<Category, string> = {
  Coins: "oklch(0.75 0.1 85)",
  Stamps: "oklch(0.68 0.1 25)",
  Paintings: "oklch(0.7 0.09 310)",
  Watches: "oklch(0.7 0.08 230)",
  Comics: "oklch(0.7 0.1 140)",
  Relics: "oklch(0.7 0.08 55)",
}

const TRAIT_LABEL: Record<string, string> = {
  appreciation: "Appreciation",
  collection: "Collection",
  set: "Set",
  rarity: "Rare",
  pairing: "Historical Pairing",
}

interface CollectibleCardProps {
  cardId: CollectibleId
  size?: "lg" | "sm"
  /** Current calculated value; falls back to the printed value when omitted. */
  currentValue?: number
}

export function CollectibleCard({ cardId, size = "lg", currentValue }: CollectibleCardProps) {
  const def = getCard(cardId)
  const styles = card({ size })
  const tint = CATEGORY_HUE[def.category]

  return (
    <article className={styles.root()}>
      <div className={styles.trim()} style={{ backgroundColor: TIER_COLOR[def.tier] }} />
      <header className={styles.header()}>
        <span className={styles.tier()} style={{ color: TIER_COLOR[def.tier] }}>
          {TIER_NUMERAL[def.tier]}
        </span>
        <span className={styles.category()}>{def.category}</span>
      </header>
      <div className={styles.seal()} style={{ borderColor: tint, color: tint }} aria-hidden>
        <span className={styles.sealInitial()}>{def.category[0]}</span>
      </div>
      <h3 className={styles.name()}>{def.name}</h3>
      <p className={styles.traitName()}>{TRAIT_LABEL[def.trait]}</p>
      <p className={styles.trait()}>{def.traitDescription}</p>
      <p className={styles.history()}>{def.historicalDescription}</p>
      <footer className={styles.footer()}>
        <span className={styles.printed()}>Starting Price {formatMoney(def.printedValue)}</span>
        <span className={styles.value()} title="Current value">
          {formatMoney(currentValue ?? def.printedValue)}
        </span>
      </footer>
    </article>
  )
}
