import { TIER_CONFIG, type TraitId } from "@collectors-crown/shared"
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Heading,
  Popover,
} from "react-aria-components"
import { TRAIT_LABEL } from "./collectible-card"
import { CloseIcon, HelpIcon, TRAIT_ICONS } from "./icons"

/** "$100 / $300 / $800" — the trait's bonus across Tiers I / II / III. */
function perTier(
  key:
    | "appreciationPerRound"
    | "collectionBonusPerMatch"
    | "rarityBonusPerOpponent"
    | "pairingBonus",
): string {
  return ([1, 2, 3] as const).map((t) => `$${TIER_CONFIG[t][key]}`).join(" / ")
}

const TRAIT_HELP: Record<TraitId, string> = {
  appreciation: `Gains ${perTier("appreciationPerRound")} (Tier I/II/III) in value at the end of every round.`,
  collection: `Gains ${perTier("collectionBonusPerMatch")} (Tier I/II/III) for each collectible you own in its category, including itself.`,
  set: "Part of a 3-card set. Value is multiplied by the number of set cards you own.",
  rarity: `Gains ${perTier("rarityBonusPerOpponent")} (Tier I/II/III) for every opponent who owns zero Rare collectibles; the bonus shrinks as opponents collect their own Rares.`,
  pairing: `Gains ${perTier("pairingBonus")} (Tier I/II/III) if you own at least one collectible of its paired category.`,
}

const TRAITS = Object.keys(TRAIT_HELP) as TraitId[]

/** Floating question-mark button; expands into a reference of all traits. */
export function TraitHelp() {
  return (
    <div className="fixed top-4 right-4 z-10">
      <DialogTrigger>
        <AriaButton
          aria-label="Trait reference"
          className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface/80 text-secondary shadow-lg transition-colors outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
        >
          <HelpIcon />
        </AriaButton>
        <Popover
          isNonModal
          placement="bottom end"
          offset={8}
          className="w-80 origin-top-right rounded-lg border border-border bg-surface shadow-2xl data-entering:animate-help-in data-exiting:animate-help-out"
        >
          <Dialog className="outline-none">
            {({ close }) => (
              <>
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                  <Heading
                    slot="title"
                    className="font-display text-lg tracking-wide"
                  >
                    Traits
                  </Heading>
                  <AriaButton
                    onPress={close}
                    aria-label="Close"
                    className="cursor-pointer rounded-md p-1 text-secondary transition-colors outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <CloseIcon width={18} height={18} />
                  </AriaButton>
                </header>
                <ul className="flex flex-col gap-4 px-4 py-4">
                  {TRAITS.map((trait) => {
                    const TraitIcon = TRAIT_ICONS[trait]
                    return (
                      <li key={trait} className="flex items-start gap-3">
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary text-primary"
                          aria-hidden
                        >
                          <TraitIcon width={16} height={16} />
                        </span>
                        <div>
                          <p className="font-display text-sm tracking-widest uppercase">
                            {TRAIT_LABEL[trait]}
                          </p>
                          <p className="pt-0.5 text-sm leading-snug text-secondary">
                            {TRAIT_HELP[trait]}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  )
}
