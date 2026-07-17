import {
  BID_INCREMENT,
  getCard,
  MAX_PURCHASES_PER_AUCTION_PHASE,
  type GameAction,
  type GameSnapshot,
  type PlayerId,
  type StandardAuctionState,
} from "@collectors-crown/shared"
import { formatMoney } from "../../lib/format"
import {
  bidderName,
  controls,
  highBid,
  lamplight,
  lot,
  lotLabel,
  placard,
  queueNote,
  stage,
  status,
} from "./auction-stage.styles"
import { BidControls } from "./bid-controls"
import { CollectibleCard } from "./collectible-card"
import { LotRail } from "./lot-rail"

interface AuctionStageProps {
  game: GameSnapshot
  auction: StandardAuctionState
  myPlayerId: PlayerId
  send: (action: GameAction) => void
}

export function AuctionStage({
  game,
  auction,
  myPlayerId,
  send,
}: AuctionStageProps) {
  const me = game.players.find((p) => p.id === myPlayerId)
  const activePlayer = game.players[auction.turnSeat]
  const isMyTurn = activePlayer?.id === myPlayerId
  const iPassed = auction.passed.includes(myPlayerId)
  const iWasAutoPassed = auction.autoPassed.includes(myPlayerId)
  const atCap =
    (game.purchasesThisPhase[myPlayerId] ?? 0) >=
    MAX_PURCHASES_PER_AUCTION_PHASE

  if (!auction.current || !me) return null

  const startingPrice = getCard(auction.current).printedValue
  const minBid =
    auction.highBid === null ? startingPrice : auction.highBid + BID_INCREMENT
  const highBidderName = game.players.find(
    (p) => p.id === auction.highBidder,
  )?.name

  return (
    <section className={stage()}>
      <LotRail results={auction.results} players={game.players} />
      <div className={lamplight()} aria-hidden />
      <p className={lotLabel()}>
        Lot on the block · {auction.queue.length} more to come
      </p>
      <div className={lot()} key={auction.current}>
        <CollectibleCard cardId={auction.current} size="lg" />
      </div>

      <div className={placard()}>
        {auction.highBid === null ? (
          <p className={highBid({ empty: true })}>
            Starting Price {formatMoney(startingPrice)}
          </p>
        ) : (
          <>
            <p className={highBid({ empty: false })}>
              High bid {formatMoney(auction.highBid)}
            </p>
            <p className={bidderName()}>held by {highBidderName}</p>
          </>
        )}

        {isMyTurn ? (
          <div className={controls()}>
            <BidControls
              key={`${auction.current}-${auction.highBid ?? 0}`}
              minBid={minBid}
              maxBid={me.cash}
              onBid={(amount) => send({ type: "bid", amount })}
              onPass={() => send({ type: "pass" })}
            />
          </div>
        ) : (
          <p className={status()}>
            {iWasAutoPassed
              ? "You couldn't cover the bid — automatically passed on this lot."
              : iPassed
                ? atCap
                  ? `You've bought ${MAX_PURCHASES_PER_AUCTION_PHASE} this phase — sitting out.`
                  : "You passed on this lot."
                : `${activePlayer?.name} is deciding…`}
          </p>
        )}
      </div>

      <p className={queueNote()}>
        You may buy {MAX_PURCHASES_PER_AUCTION_PHASE} lots per auction phase ·
        bought {game.purchasesThisPhase[myPlayerId] ?? 0} so far
      </p>
    </section>
  )
}
