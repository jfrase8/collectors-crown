import type { CollectibleId } from "@collectors-crown/shared"
import { useEffect } from "react"
import { formatMoney } from "../../lib/format"
import { CollectibleCard } from "./collectible-card"

export type Interstitial =
  | { kind: "income"; amount: number; round: number }
  | { kind: "appreciation"; round: number; gains: { cardId: CollectibleId; gained: number }[] }

interface PhaseInterstitialProps {
  interstitial: Interstitial
  onDone: () => void
}

const DISMISS_AFTER_MS = 3200

/** Brief overlay between phases: income received, or cards appreciating. */
export function PhaseInterstitial({ interstitial, onDone }: PhaseInterstitialProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, DISMISS_AFTER_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-30 flex animate-fade-in cursor-pointer flex-col items-center justify-center gap-6 bg-background/85 backdrop-blur-sm"
      onClick={onDone}
      role="status"
    >
      {interstitial.kind === "income" ? (
        <>
          <p className="text-sm tracking-[0.25em] text-secondary/70 uppercase">
            Round {interstitial.round} · Income
          </p>
          <p className="animate-lot-reveal font-display text-6xl text-primary">
            +{formatMoney(interstitial.amount)}
          </p>
          <p className="text-secondary italic">The market is opening…</p>
        </>
      ) : (
        <>
          <p className="text-sm tracking-[0.25em] text-secondary/70 uppercase">
            End of Round {interstitial.round} · Appreciation
          </p>
          <ul className="flex max-w-4xl flex-wrap justify-center gap-4">
            {interstitial.gains.map(({ cardId, gained }) => (
              <li key={cardId} className="flex animate-lot-reveal flex-col items-center gap-1">
                <CollectibleCard cardId={cardId} size="sm" />
                <span className="font-display text-lg text-primary">+{formatMoney(gained)}</span>
              </li>
            ))}
          </ul>
          <p className="text-secondary italic">Your collection grows more valuable…</p>
        </>
      )}
    </div>
  )
}
