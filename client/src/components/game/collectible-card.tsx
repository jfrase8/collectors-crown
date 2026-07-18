import { getCard, type Category, type CollectibleId, type Tier } from "@collectors-crown/shared"
import { formatMoney } from "../../lib/format"
import { card, compactCard } from "./collectible-card.styles"
import { CATEGORY_ICONS, CrownIcon, TRAIT_ICONS } from "./icons"

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
  const value = currentValue ?? def.printedValue
  const tint = CATEGORY_HUE[def.category]
  const tierColor = TIER_COLOR[def.tier]
  const CategoryIcon = CATEGORY_ICONS[def.category]
  const TraitIcon = TRAIT_ICONS[def.trait]

  if (size === "sm") {
    const styles = compactCard()
    return (
      <article className={styles.root()}>
        <div className={styles.trim()} style={{ backgroundColor: tierColor }} />
        <div className={styles.header()}>
          <span className={styles.tier()} style={{ color: tierColor }}>
            {TIER_NUMERAL[def.tier]}
          </span>
          <span style={{ color: tint }} title={def.category}>
            <CategoryIcon width={16} height={16} />
          </span>
        </div>
        <h3 className={styles.name()}>{def.name}</h3>
        <footer className={styles.footer()}>
          <span className={styles.traitIcon()} title={TRAIT_LABEL[def.trait]}>
            <TraitIcon width={16} height={16} />
          </span>
          <span className={styles.value()} title="Current value">
            {formatMoney(value)}
          </span>
        </footer>
      </article>
    )
  }

  const styles = card()
  return (
    <article className={styles.root()}>
      <div className={styles.frame()} aria-hidden />
      <div className={styles.tierBanner()} style={{ color: tierColor, borderColor: tierColor }}>
        Tier {TIER_NUMERAL[def.tier]}
      </div>
      <h3 className={styles.name()}>{def.name}</h3>
      <div className={styles.seal()} style={{ borderColor: tint, color: tint }} aria-hidden>
        <span className={styles.sealInitial()}>{def.category[0]}</span>
      </div>
      <div className={styles.categoryRow()}>
        <span style={{ color: tint }} aria-hidden>
          <CategoryIcon width={18} height={18} />
        </span>
        <span className={styles.categoryLabel()}>Category: {def.category}</span>
      </div>
      <div className={styles.traitBox()}>
        <span className={styles.traitBadge()} aria-hidden>
          <TraitIcon />
        </span>
        <div>
          <p className={styles.traitLabel()}>Trait:</p>
          <p className={styles.traitName()}>{TRAIT_LABEL[def.trait]}</p>
          <p className={styles.traitDesc()}>{def.traitDescription}</p>
        </div>
      </div>
      <p className={styles.history()}>{def.historicalDescription}</p>
      <footer className={styles.banner()}>
        <CrownIcon width={16} height={16} className="text-primary" />
        {value === def.printedValue ? (
          <span className={styles.printed()}>Starting Price</span>
        ) : (
          <span className={styles.printed()}>
            Current Value · started {formatMoney(def.printedValue)}
          </span>
        )}
        <span className={styles.value()}>{formatMoney(value)}</span>
      </footer>
    </article>
  )
}
