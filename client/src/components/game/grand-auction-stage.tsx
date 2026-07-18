import {
  BID_INCREMENT,
  getCard,
  MAX_PURCHASES_PER_AUCTION_PHASE,
  type CollectibleId,
  type GameAction,
  type GameSnapshot,
  type GrandAuctionState,
  type PlayerId,
} from "@collectors-crown/shared"
import { useState } from "react"
import { Button as AriaButton, Tooltip, TooltipTrigger } from "react-aria-components"
import { formatMoney } from "../../lib/format"
import { Button } from "../button"
import { BidControls } from "./bid-controls"
import { CollectibleCard } from "./collectible-card"

interface GrandAuctionStageProps {
  game: GameSnapshot
  auction: GrandAuctionState
  myPlayerId: PlayerId
  send: (action: GameAction) => void
}

function topBid(auction: GrandAuctionState, cardId: CollectibleId) {
  let best: { playerId: PlayerId; amount: number; seq: number } | null = null
  for (const bid of auction.bids[cardId] ?? []) {
    if (!best || bid.amount > best.amount || (bid.amount === best.amount && bid.seq < best.seq)) {
      best = bid
    }
  }
  return best
}

/** Cash a player has already promised across their standing bids. */
function committedCash(auction: GrandAuctionState, playerId: PlayerId): number {
  return Object.values(auction.bids)
    .flat()
    .filter((b) => b.playerId === playerId)
    .reduce((sum, b) => sum + b.amount, 0)
}

export function GrandAuctionStage({ game, auction, myPlayerId, send }: GrandAuctionStageProps) {
  const [selected, setSelected] = useState<CollectibleId | null>(null)
  const me = game.players.find((p) => p.id === myPlayerId)
  if (!me) return null

  if (auction.pendingChoice) {
    return (
      <ChooseWinnings
        wonCards={auction.pendingChoice.wonCards}
        isMe={auction.pendingChoice.playerId === myPlayerId}
        chooserName={
          game.players.find((p) => p.id === auction.pendingChoice?.playerId)?.name ?? ""
        }
        send={send}
      />
    )
  }

  const activePlayer = game.players[auction.turnSeat]
  const isMyTurn = activePlayer?.id === myPlayerId
  const iPassed = auction.passed.includes(myPlayerId)
  const myBidsLeft = auction.bidsRemaining[myPlayerId] ?? 0

  const selectedTop = selected ? topBid(auction, selected) : null
  const minBid = selected
    ? selectedTop === null
      ? getCard(selected).printedValue
      : selectedTop.amount + BID_INCREMENT
    : 0
  const myStandingBid = selected
    ? (auction.bids[selected]?.find((b) => b.playerId === myPlayerId)?.amount ?? 0)
    : 0
  // Raising replaces your standing bid on that lot, freeing that cash.
  const maxBid = me.cash - committedCash(auction, myPlayerId) + myStandingBid

  return (
    <section className="flex flex-1 flex-col items-center gap-5 py-4">
      <div className="text-center">
        <p className="text-sm tracking-widest text-secondary uppercase">
          Every lot is on the table · five bids each
        </p>
        <p className="text-secondary">
          You have <span className="font-semibold text-primary">{myBidsLeft}</span> bid
          {myBidsLeft === 1 ? "" : "s"} left
          {iPassed && " — you have passed"}
        </p>
      </div>

      <ul className="flex max-w-5xl flex-wrap justify-center gap-4">
        {auction.cards.map((cardId) => {
          const top = topBid(auction, cardId)
          const holder = game.players.find((p) => p.id === top?.playerId)
          const isSelected = selected === cardId
          const mine = top?.playerId === myPlayerId
          return (
            <li key={cardId} className="flex flex-col items-center gap-1">
              <TooltipTrigger delay={250} closeDelay={100}>
                <AriaButton
                  onPress={() => setSelected(isSelected ? null : cardId)}
                  className={`rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CollectibleCard cardId={cardId} size="sm" />
                </AriaButton>
                <Tooltip placement="top" offset={10} className="z-20">
                  <CollectibleCard cardId={cardId} size="lg" />
                </Tooltip>
              </TooltipTrigger>
              <span className={`text-xs ${mine ? "text-primary" : "text-secondary"}`}>
                {top && holder
                  ? `${formatMoney(top.amount)} — ${mine ? "you" : holder.name}`
                  : `Starting Price ${formatMoney(getCard(cardId).printedValue)}`}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="flex min-h-14 flex-col items-center gap-2">
        {isMyTurn ? (
          selected ? (
            <BidControls
              key={`${selected}-${minBid}`}
              minBid={minBid}
              maxBid={maxBid}
              onBid={(amount) => {
                send({ type: "grand_bid", collectibleId: selected, amount })
                setSelected(null)
              }}
              onPass={() => send({ type: "grand_pass" })}
              passLabel="Pass for the rest"
            />
          ) : (
            <>
              <p className="text-secondary italic">Select a lot to place or raise a bid.</p>
              <Button variant="secondary" onPress={() => send({ type: "grand_pass" })}>
                Pass for the rest
              </Button>
            </>
          )
        ) : (
          <p className="text-secondary italic">
            {iPassed || myBidsLeft === 0
              ? "Waiting for the other bidders…"
              : `${activePlayer?.name} is deciding…`}
          </p>
        )}
      </div>
    </section>
  )
}

interface ChooseWinningsProps {
  wonCards: CollectibleId[]
  isMe: boolean
  chooserName: string
  send: (action: GameAction) => void
}

function ChooseWinnings({ wonCards, isMe, chooserName, send }: ChooseWinningsProps) {
  const [picked, setPicked] = useState<CollectibleId[]>([])

  if (!isMe) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-2">
        <h2 className="font-display text-2xl">A collector's dilemma</h2>
        <p className="text-secondary italic">
          {chooserName} won more than {MAX_PURCHASES_PER_AUCTION_PHASE} lots and is choosing which{" "}
          {MAX_PURCHASES_PER_AUCTION_PHASE} to keep…
        </p>
      </section>
    )
  }

  function toggle(cardId: CollectibleId) {
    setPicked((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : prev.length < MAX_PURCHASES_PER_AUCTION_PHASE
          ? [...prev, cardId]
          : prev,
    )
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-5">
      <div className="text-center">
        <h2 className="font-display text-2xl">You won {wonCards.length} lots</h2>
        <p className="text-secondary">
          Choose {MAX_PURCHASES_PER_AUCTION_PHASE} to keep — the rest go to the next-highest
          bidder.
        </p>
      </div>
      <ul className="flex flex-wrap justify-center gap-4">
        {wonCards.map((cardId) => (
          <li key={cardId}>
            <AriaButton
              onPress={() => toggle(cardId)}
              className={`rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                picked.includes(cardId) ? "ring-2 ring-primary" : "opacity-80"
              }`}
            >
              <CollectibleCard cardId={cardId} size="sm" />
            </AriaButton>
          </li>
        ))}
      </ul>
      <Button
        isDisabled={picked.length !== MAX_PURCHASES_PER_AUCTION_PHASE}
        onPress={() => send({ type: "choose_winnings", collectibleIds: picked })}
      >
        Keep these {MAX_PURCHASES_PER_AUCTION_PHASE}
      </Button>
    </section>
  )
}
