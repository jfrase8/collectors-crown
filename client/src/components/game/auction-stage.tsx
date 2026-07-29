import {
  BID_INCREMENT,
  getCard,
  MAX_PURCHASES_PER_AUCTION_PHASE,
  type GameAction,
  type GameSnapshot,
  type PlayerId,
  type StandardAuctionState,
} from "@collectors-crown/shared"
import { Button as AriaButton, Tooltip, TooltipTrigger } from "react-aria-components"
import { formatMoney } from "../../lib/format"
import {
  bidderName,
  controls,
  highBid,
  lotLabel,
  placard,
  stage,
  status,
} from "./auction-stage.styles"
import { BidControls } from "./bid-controls"
import { CrownIcon } from "./icons"
import { LotTrack } from "./lot-track"

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
      <p className={lotLabel()}>
        Lot on the block · {auction.queue.length} more to come
      </p>
      <div
        className={`flex min-h-0 w-full flex-1 transition-transform duration-500 ease-out ${
          isMyTurn ? "-translate-y-2" : "translate-y-0"
        }`}
      >
        <LotTrack
          results={auction.results}
          current={auction.current}
          players={game.players}
        />
      </div>

      <div className="relative">
        {/* Remaining-purchase markers: one crown per lot you can still buy
            this phase, dimming as they're spent. */}
        <TooltipTrigger delay={250} closeDelay={100}>
          <AriaButton className="absolute top-1/2 left-full ml-3 flex -translate-y-1/2 cursor-default flex-col gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {Array.from({ length: MAX_PURCHASES_PER_AUCTION_PHASE }).map((_, i) => (
              <CrownIcon
                key={i}
                width={18}
                height={18}
                className={
                  i < MAX_PURCHASES_PER_AUCTION_PHASE - (game.purchasesThisPhase[myPlayerId] ?? 0)
                    ? "text-primary"
                    : "text-secondary opacity-30"
                }
              />
            ))}
          </AriaButton>
          <Tooltip
            placement="right"
            offset={10}
            className="z-20 max-w-56 rounded-md border border-border bg-surface px-3 py-2 text-sm text-secondary"
          >
            Your remaining purchases — you may buy up to {MAX_PURCHASES_PER_AUCTION_PHASE} lots
            each auction phase.
          </Tooltip>
        </TooltipTrigger>
        <div className={placard({ myTurn: isMyTurn })}>
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
      </div>
    </section>
  )
}
