import type { CollectibleId, GamePlayer, StandardLotResult } from "@collectors-crown/shared"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { playerColor } from "../../lib/player-colors"
import { CollectibleCard } from "./collectible-card"

interface LotTrackProps {
  results: StandardLotResult[]
  current: CollectibleId
  players: readonly GamePlayer[]
}

/** Intrinsic size of a full-detail card; the track scales every card off this. */
const CARD_W = 256
const CARD_H = 448
/**
 * Fraction of the track height the full-size card fills, leaving slack top and
 * bottom so a hovered card (grown to full size) is never clipped by the scroll
 * container's edge.
 */
const FILL_RATIO = 0.9
/**
 * Fraction of the track width over which cards fade out toward the left edge.
 * A card is fully transparent by the time its left edge would be clipped.
 */
const FADE_RATIO = 0.35

/**
 * One horizontal carousel of cards. The lot on the block sits at the right,
 * centered on screen; already-auctioned lots trail off to the left — their
 * frames tinted with the buyer's color — fading out as they approach the edge.
 * Once the strip overflows it becomes a pointer-drag scroller (no visible
 * scrollbar). Hovering an auctioned card grows it to the same size as the lot
 * on the block, restores full opacity, and scrolls it fully into view.
 *
 * Edge fade: each card carries its own gradient mask, with stops positioned
 * (on scroll and resize) so all cards sample one continuous strip-wide
 * gradient — real per-pixel transparency, so cards dissolve into whatever is
 * behind them (plain background and radial turn glow alike), reaching alpha 0
 * exactly at the clip boundary so a card is invisible before the scroll
 * container ever cuts into it. Masking per card — not the whole strip — lets a
 * hovered card drop just its own mask to step out of the fade.
 */
export function LotTrack({ results, current, players }: LotTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const drag = useRef({ active: false, startX: 0, startScroll: 0 })
  const [scale, setScale] = useState(1)
  const [pad, setPad] = useState(0)
  // Whether cards are hidden off the left edge (shows the back-to-start arrow).
  const [canScrollBack, setCanScrollBack] = useState(false)
  // Whether the strip is scrolled left of its resting position (shows the
  // forward arrow that returns to the current lot).
  const [canScrollForward, setCanScrollForward] = useState(false)

  // Each card carries its own gradient mask, with stop positions (--fade-from,
  // --fade-to) placed so every card samples the same strip-wide gradient:
  // alpha 0 exactly at the container's left edge (where clipping would start)
  // rising to 1 at FADE_RATIO of the track width. Adjacent cards therefore
  // fade continuously, and each card is itself a right-to-left gradient rather
  // than dimming as one block. Written straight to the DOM (not state) since
  // it changes on every scrolled pixel.
  const updateFades = () => {
    const list = listRef.current
    if (!list) return
    const { left, width } = list.getBoundingClientRect()
    const fadeW = width * FADE_RATIO
    for (const el of list.querySelectorAll<HTMLElement>("li")) {
      const r = el.getBoundingClientRect()
      el.style.setProperty("--fade-from", `${left - r.left}px`)
      el.style.setProperty("--fade-to", `${left + fadeW - r.left}px`)
    }
    setCanScrollBack(list.scrollLeft > 1)
    setCanScrollForward(list.scrollLeft < list.scrollWidth - list.clientWidth - 1)
  }

  // Scale each card to fit the track height, leaving slack so a hovered card
  // (grown to full size) is never clipped top or bottom. The strip is
  // right-anchored with right padding so the current (last) card sits in the
  // screen's center; older cards trail left and fade out near the left edge.
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const fit = () => {
      const { width, height } = track.getBoundingClientRect()
      if (!width || !height) return
      const s = Math.min(1, (height * FILL_RATIO) / CARD_H)
      setScale(s)
      // Center relative to the strip itself (inside the arrow gutters), not
      // the outer track, so a lone card sits dead center.
      const stripW = listRef.current?.clientWidth ?? width
      setPad(Math.max(0, stripW / 2 - (CARD_W * s) / 2))
      updateFades()
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(track)
    return () => ro.disconnect()
  }, [])

  // Recenter on the lot on the block only when a new card enters it (or the
  // track geometry itself changes at mount/resize) — never from hovering or
  // dragging. With right padding sized to exactly the room it needs, the
  // scroll range is bounded to [oldest lot flush left, current lot centered],
  // and max scroll is the centered extreme.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTo({ left: list.scrollWidth, behavior: "smooth" })
    updateFades()
  }, [current, pad, scale])

  const handlePointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    const list = listRef.current
    if (!list) return
    drag.current = { active: true, startX: e.clientX, startScroll: list.scrollLeft }
    list.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const list = listRef.current
    if (!list || !drag.current.active) return
    const next = drag.current.startScroll - (e.clientX - drag.current.startX)
    // The native overflow clamp stops at both ends too; this just keeps the
    // drag from over-shooting past the bounds.
    list.scrollLeft = Math.min(Math.max(next, 0), list.scrollWidth - list.clientWidth)
  }

  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    drag.current.active = false
    listRef.current?.releasePointerCapture(e.pointerId)
  }

  // A scroll container can't show content past its edge, so a partially
  // cut-off card is instead nudged fully into view when hovered. The li's
  // scroll-margin (scroll-ml-6) makes the nudge overshoot the flush position,
  // leaving clearance so the card still fits once grown to full size. The
  // nudge waits for the hover-growth transition to finish, so a cursor merely
  // passing across the strip never drags the carousel along with it.
  const revealTimer = useRef<number | undefined>(undefined)
  const revealOnHover = (e: React.MouseEvent<HTMLLIElement>) => {
    const el = e.currentTarget
    window.clearTimeout(revealTimer.current)
    revealTimer.current = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" })
    }, 350)
  }
  const cancelReveal = () => window.clearTimeout(revealTimer.current)

  // Every card shares one footprint: the current lot rests at full scale,
  // auctioned lots at 90%, so a lot flipping states (and a hover) animates its
  // scale in place and a hovered card matches the current lot's size exactly.
  const cardW = CARD_W * scale
  const cardH = CARD_H * scale

  const slots = [
    ...results.map((result) => ({ id: result.cardId, result })),
    { id: current, result: null as StandardLotResult | null },
  ]
  const newest = slots.length - 1

  return (
    <div ref={trackRef} className="relative flex min-h-0 w-full flex-1 items-center px-12">
      {/* Back-to-start arrow, in the gutter reserved left of the carousel:
          visible only while cards are hidden off the left edge; slides all the
          way to the oldest lot, then disappears. */}
      <button
        type="button"
        aria-label="Scroll to the first lot"
        onClick={() => listRef.current?.scrollTo({ left: 0, behavior: "smooth" })}
        className={`absolute top-1/2 left-0 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-border bg-surface/80 p-2 text-secondary transition-opacity duration-300 hover:text-primary ${
          canScrollBack ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" aria-hidden>
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* Forward arrow, in the right gutter: visible while the strip is
          scrolled left of its resting position; slides back to the current
          lot, then disappears. */}
      <button
        type="button"
        aria-label="Scroll back to the current lot"
        onClick={() =>
          listRef.current?.scrollTo({ left: listRef.current.scrollWidth, behavior: "smooth" })
        }
        className={`absolute top-1/2 right-0 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-border bg-surface/80 p-2 text-secondary transition-opacity duration-300 hover:text-primary ${
          canScrollForward ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" aria-hidden>
          <path
            d="M9 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ul
        ref={listRef}
        onScroll={updateFades}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="flex h-full w-full cursor-grab touch-pan-y items-center gap-4 overflow-x-auto select-none scrollbar-none [&::-webkit-scrollbar]:hidden"
        style={{ paddingRight: pad }}
      >
        {slots.map((slot, index) => {
          const isCurrent = index === newest
          // The buyer's seat color tints the card frame; passed-over lots keep
          // the neutral frame.
          const winnerSeat = slot.result?.winnerId
            ? players.findIndex((p) => p.id === slot.result!.winnerId)
            : -1
          const accent = winnerSeat >= 0 ? playerColor(winnerSeat) : undefined
          return (
            <li
              key={slot.id}
              onMouseEnter={isCurrent ? undefined : revealOnHover}
              onMouseLeave={isCurrent ? undefined : cancelReveal}
              style={
                {
                  width: cardW,
                  height: cardH,
                  // Fully opaque until updateFades positions the real stops.
                  ["--fade-from" as string]: "-2px",
                  ["--fade-to" as string]: "-1px",
                } as React.CSSProperties
              }
              className={`group relative shrink-0 scroll-ml-6 transition-transform duration-500 ease-out mask-[linear-gradient(to_right,transparent_var(--fade-from),#000_var(--fade-to))] ${
                isCurrent
                  ? "z-10 scale-100"
                  : "scale-90 hover:z-20 hover:scale-100 hover:mask-none"
              } ${index === 0 ? "ml-auto" : ""}`}
            >
              {/* The card renders at intrinsic size and is centered + scaled
                  via transform, so scale changes animate in place without
                  shifting neighbors. */}
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
                className="absolute top-1/2 left-1/2"
              >
                <CollectibleCard cardId={slot.id} size="lg" accent={accent} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
