import type { PlayerId } from "../types.js";
import { cardsForTier, getCard } from "./cards.js";
import {
  auctionRevealCount,
  BID_INCREMENT,
  GRAND_AUCTION_BIDS_PER_PLAYER,
  isGrandAuctionRound,
  MAX_GAME_PLAYERS,
  MAX_PURCHASES_PER_AUCTION_PHASE,
  MIN_GAME_PLAYERS,
  STARTING_CASH,
  TIER_CONFIG,
  tierForRound,
  TOTAL_ROUNDS,
} from "./constants.js";
import { CHARACTERS } from "./characters.js";
import { createRng, shuffle } from "./rng.js";
import type {
  ActionResult,
  CollectibleId,
  GameAction,
  GamePlayer,
  GameSnapshot,
  GameState,
  GrandAuctionState,
  GrandBid,
  StandardAuctionState,
} from "./types.js";
import { computeFinalScores, currentValue } from "./valuation.js";

// Pure, deterministic game engine. All mutation happens on a clone inside
// applyAction; the same state + action always produces the same result.
// Rendering and transport live elsewhere.

export interface NewGamePlayer {
  id: PlayerId;
  name: string;
  characterId?: string;
}

export function createGame(gameId: string, players: NewGamePlayer[], seed: number): GameState {
  if (players.length < MIN_GAME_PLAYERS || players.length > MAX_GAME_PLAYERS) {
    throw new Error(`Player count must be ${MIN_GAME_PLAYERS}–${MAX_GAME_PLAYERS}.`);
  }
  const rng = createRng(seed);
  const gamePlayers: GamePlayer[] = players.map((p, i) => ({
    id: p.id,
    name: p.name,
    characterId: p.characterId ?? CHARACTERS[i % CHARACTERS.length].id,
    cash: STARTING_CASH,
    collection: [],
    connected: true,
  }));

  const state: GameState = {
    gameId,
    seed,
    players: gamePlayers,
    round: 1,
    phase: "auction",
    firstPlayerSeat: 0,
    auction: null,
    purchasesThisPhase: {},
    decks: {
      1: shuffle(cardsForTier(1), rng).map((c) => c.id),
      2: shuffle(cardsForTier(2), rng).map((c) => c.id),
      3: shuffle(cardsForTier(3), rng).map((c) => c.id),
    },
    discard: [],
    marketDone: [],
    finalScores: null,
    version: 0,
  };
  startAuctionPhase(state);
  return state;
}

export function applyAction(
  prev: GameState,
  playerId: PlayerId,
  action: GameAction,
): ActionResult {
  const state = structuredClone(prev);
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return fail("You are not in this game.");
  if (state.phase === "finished") return fail("The game is over.");

  let error: string | null;
  switch (action.type) {
    case "bid":
      error = handleStandardBid(state, playerId, action.amount);
      break;
    case "pass":
      error = handleStandardPass(state, playerId);
      break;
    case "grand_bid":
      error = handleGrandBid(state, playerId, action.collectibleId, action.amount);
      break;
    case "grand_pass":
      error = handleGrandPass(state, playerId);
      break;
    case "choose_winnings":
      error = handleChooseWinnings(state, playerId, action.collectibleIds);
      break;
    case "sell":
      error = handleSell(state, playerId, action.collectibleId);
      break;
    case "market_done":
      error = handleMarketDone(state, playerId);
      break;
  }
  if (error) return fail(error);
  state.version = prev.version + 1;
  return { ok: true, state };
}

export function toSnapshot(state: GameState): GameSnapshot {
  const { decks, seed: _seed, ...rest } = structuredClone(state);
  return {
    ...rest,
    deckCounts: { 1: decks[1].length, 2: decks[2].length, 3: decks[3].length },
  };
}

function fail(error: string): ActionResult {
  return { ok: false, error };
}

// ---------------------------------------------------------------------------
// Phase transitions
// ---------------------------------------------------------------------------

function startAuctionPhase(state: GameState) {
  state.phase = "auction";
  state.purchasesThisPhase = {};
  const deck = state.decks[tierForRound(state.round)];
  const revealCount = Math.min(auctionRevealCount(state.players.length), deck.length);
  const revealed = deck.splice(0, revealCount);

  if (isGrandAuctionRound(state.round)) {
    const grand: GrandAuctionState = {
      kind: "grand",
      cards: revealed,
      bids: Object.fromEntries(revealed.map((id) => [id, []])),
      bidsRemaining: Object.fromEntries(
        state.players.map((p) => [p.id, GRAND_AUCTION_BIDS_PER_PLAYER]),
      ),
      passed: [],
      turnSeat: state.firstPlayerSeat,
      nextSeq: 0,
      pendingChoice: null,
    };
    state.auction = grand;
    if (revealed.length === 0) endAuctionPhase(state);
    return;
  }

  const standard: StandardAuctionState = {
    kind: "standard",
    queue: revealed,
    current: null,
    highBid: null,
    highBidder: null,
    passed: [],
    autoPassed: [],
    turnSeat: state.firstPlayerSeat,
    results: [],
  };
  state.auction = standard;
  startNextStandardCard(state, standard);
}

function endAuctionPhase(state: GameState) {
  state.auction = null;
  if (state.round === TOTAL_ROUNDS) {
    // End of game: no income, no market — only appreciation, then scoring.
    applyAppreciation(state);
    state.phase = "finished";
    state.finalScores = computeFinalScores(state);
    return;
  }
  // Income Phase is automatic, then the Market Phase opens.
  const income = TIER_CONFIG[tierForRound(state.round)].income;
  for (const p of state.players) p.cash += income;
  state.phase = "market";
  state.marketDone = [];
}

function endRound(state: GameState) {
  applyAppreciation(state);
  state.round += 1;
  state.firstPlayerSeat = (state.firstPlayerSeat + 1) % state.players.length;
  state.marketDone = [];
  startAuctionPhase(state);
}

function applyAppreciation(state: GameState) {
  for (const player of state.players) {
    for (const owned of player.collection) {
      const card = getCard(owned.id);
      if (card.trait === "appreciation") {
        owned.currentAppreciation += TIER_CONFIG[card.tier].appreciationPerRound;
      }
    }
  }
}

function purchases(state: GameState, playerId: PlayerId): number {
  return state.purchasesThisPhase[playerId] ?? 0;
}

function atPurchaseCap(state: GameState, playerId: PlayerId): boolean {
  return purchases(state, playerId) >= MAX_PURCHASES_PER_AUCTION_PHASE;
}

function giveCard(state: GameState, playerId: PlayerId, cardId: CollectibleId, price: number) {
  const player = state.players.find((p) => p.id === playerId)!;
  player.cash -= price;
  player.collection.push({ id: cardId, currentAppreciation: 0 });
  state.purchasesThisPhase[playerId] = purchases(state, playerId) + 1;
}

// ---------------------------------------------------------------------------
// Standard auction
// ---------------------------------------------------------------------------

function getStandardAuction(state: GameState): StandardAuctionState | null {
  return state.phase === "auction" && state.auction?.kind === "standard" ? state.auction : null;
}

/** First bids must meet the card's printed value; raises go up by $100. */
function minimumBid(auction: StandardAuctionState): number {
  return auction.highBid === null
    ? getCard(auction.current!).printedValue
    : auction.highBid + BID_INCREMENT;
}

function finishLot(
  state: GameState,
  auction: StandardAuctionState,
  winnerId: PlayerId | null,
  price: number | null,
) {
  const cardId = auction.current!;
  if (winnerId !== null && price !== null) {
    giveCard(state, winnerId, cardId, price);
  } else {
    state.discard.push(cardId);
  }
  auction.results.push({ cardId, winnerId, price });
  startNextStandardCard(state, auction);
}

function startNextStandardCard(state: GameState, auction: StandardAuctionState) {
  const next = auction.queue.shift();
  if (!next) {
    endAuctionPhase(state);
    return;
  }
  auction.current = next;
  auction.highBid = null;
  auction.highBidder = null;
  auction.passed = [];
  auction.autoPassed = [];
  // Players at the purchase cap or unable to cover the starting price are out.
  const startingPrice = getCard(next).printedValue;
  for (const player of state.players) {
    if (atPurchaseCap(state, player.id)) {
      auction.passed.push(player.id);
    } else if (player.cash < startingPrice) {
      auction.passed.push(player.id);
      auction.autoPassed.push(player.id);
    }
  }
  auction.turnSeat = state.firstPlayerSeat;
  if (!resolveLotIfSettled(state, auction)) {
    if (auction.passed.includes(state.players[auction.turnSeat].id)) {
      advanceStandardTurn(state, auction);
    }
  }
}

/**
 * Finishes the lot when bidding is over: sold to the high bidder, handed to
 * the sole remaining player at starting price, or discarded when everyone
 * passed. Returns true when the lot was resolved.
 */
function resolveLotIfSettled(state: GameState, auction: StandardAuctionState): boolean {
  const remaining = state.players.filter((p) => !auction.passed.includes(p.id));
  if (auction.highBidder !== null) {
    if (remaining.every((p) => p.id === auction.highBidder)) {
      finishLot(state, auction, auction.highBidder, auction.highBid);
      return true;
    }
    return false;
  }
  if (remaining.length === 0) {
    finishLot(state, auction, null, null);
    return true;
  }
  if (remaining.length === 1) {
    // Everyone else passed before any bid: the last player standing takes
    // the lot automatically at its starting price.
    finishLot(state, auction, remaining[0].id, getCard(auction.current!).printedValue);
    return true;
  }
  return false;
}

/**
 * Moves the turn to the next player who can still act on the current card.
 * Players who cannot cover the minimum bid are passed automatically.
 */
function advanceStandardTurn(state: GameState, auction: StandardAuctionState) {
  if (resolveLotIfSettled(state, auction)) return;
  const n = state.players.length;
  for (let step = 1; step <= n; step++) {
    const seat = (auction.turnSeat + step) % n;
    const candidate = state.players[seat];
    if (auction.passed.includes(candidate.id)) continue;
    if (candidate.id === auction.highBidder) continue; // never raises own bid
    if (candidate.cash < minimumBid(auction)) {
      auction.passed.push(candidate.id);
      auction.autoPassed.push(candidate.id);
      if (resolveLotIfSettled(state, auction)) return;
      continue;
    }
    auction.turnSeat = seat;
    return;
  }
  resolveLotIfSettled(state, auction);
}

function validateBidAmount(amount: number, minimum: number, cash: number): string | null {
  if (!Number.isInteger(amount) || amount % BID_INCREMENT !== 0)
    return `Bids must be multiples of $${BID_INCREMENT}.`;
  if (amount < minimum) return `Bid must be at least $${minimum}.`;
  if (amount > cash) return "You cannot bid more cash than you have.";
  return null;
}

function handleStandardBid(state: GameState, playerId: PlayerId, amount: number): string | null {
  const auction = getStandardAuction(state);
  if (!auction || auction.current === null) return "There is no standard auction in progress.";
  if (state.players[auction.turnSeat].id !== playerId) return "It is not your turn.";
  if (auction.passed.includes(playerId)) return "You have passed on this collectible.";

  const player = state.players.find((p) => p.id === playerId)!;
  const error = validateBidAmount(amount, minimumBid(auction), player.cash);
  if (error) return error;

  auction.highBid = amount;
  auction.highBidder = playerId;
  advanceStandardTurn(state, auction);
  return null;
}

function handleStandardPass(state: GameState, playerId: PlayerId): string | null {
  const auction = getStandardAuction(state);
  if (!auction || auction.current === null) return "There is no standard auction in progress.";
  if (state.players[auction.turnSeat].id !== playerId) return "It is not your turn.";

  auction.passed.push(playerId);
  advanceStandardTurn(state, auction);
  return null;
}

// ---------------------------------------------------------------------------
// Grand auction
// ---------------------------------------------------------------------------

function getGrandAuction(state: GameState): GrandAuctionState | null {
  return state.phase === "auction" && state.auction?.kind === "grand" ? state.auction : null;
}

function highestBid(bids: GrandBid[]): GrandBid | null {
  let best: GrandBid | null = null;
  for (const bid of bids) {
    if (!best || bid.amount > best.amount || (bid.amount === best.amount && bid.seq < best.seq)) {
      best = bid;
    }
  }
  return best;
}

/** Sum of a player's standing bids — cash they must be able to cover. */
function committedCash(auction: GrandAuctionState, playerId: PlayerId): number {
  return Object.values(auction.bids)
    .flat()
    .filter((b) => b.playerId === playerId)
    .reduce((sum, b) => sum + b.amount, 0);
}

function grandTurnDone(auction: GrandAuctionState, playerId: PlayerId): boolean {
  return auction.bidsRemaining[playerId] === 0 || auction.passed.includes(playerId);
}

function advanceGrandTurn(state: GameState, auction: GrandAuctionState) {
  const n = state.players.length;
  for (let step = 1; step <= n; step++) {
    const seat = (auction.turnSeat + step) % n;
    if (!grandTurnDone(auction, state.players[seat].id)) {
      auction.turnSeat = seat;
      return;
    }
  }
  resolveGrandAuction(state, auction);
}

function handleGrandBid(
  state: GameState,
  playerId: PlayerId,
  cardId: CollectibleId,
  amount: number,
): string | null {
  const auction = getGrandAuction(state);
  if (!auction) return "There is no grand auction in progress.";
  if (auction.pendingChoice) return "Waiting for a player to choose their winnings.";
  if (state.players[auction.turnSeat].id !== playerId) return "It is not your turn.";
  if (grandTurnDone(auction, playerId)) return "You have no bids remaining.";

  const bids = auction.bids[cardId];
  if (!bids) return "That collectible is not in this auction.";

  const player = state.players.find((p) => p.id === playerId)!;
  const top = highestBid(bids);
  const minimum = top === null ? getCard(cardId).printedValue : top.amount + BID_INCREMENT;
  const existing = bids.find((b) => b.playerId === playerId);
  // A raise replaces the player's standing bid, freeing that committed cash.
  const available = player.cash - committedCash(auction, playerId) + (existing?.amount ?? 0);
  const error = validateBidAmount(amount, minimum, available);
  if (error) return error;

  if (existing) {
    existing.amount = amount;
    existing.seq = auction.nextSeq++;
  } else {
    bids.push({ playerId, amount, seq: auction.nextSeq++ });
  }
  auction.bidsRemaining[playerId] -= 1;
  advanceGrandTurn(state, auction);
  return null;
}

function handleGrandPass(state: GameState, playerId: PlayerId): string | null {
  const auction = getGrandAuction(state);
  if (!auction) return "There is no grand auction in progress.";
  if (auction.pendingChoice) return "Waiting for a player to choose their winnings.";
  if (state.players[auction.turnSeat].id !== playerId) return "It is not your turn.";
  if (grandTurnDone(auction, playerId)) return "You have already passed.";

  auction.passed.push(playerId);
  advanceGrandTurn(state, auction);
  return null;
}

/**
 * Determines winners from the standing bids. If any player won more than the
 * purchase cap, halts with a pendingChoice; relinquished cards cascade to the
 * next-highest bidder. Called again after each choice until stable.
 */
function resolveGrandAuction(state: GameState, auction: GrandAuctionState) {
  const wonBy = new Map<PlayerId, CollectibleId[]>();
  for (const cardId of auction.cards) {
    const top = highestBid(auction.bids[cardId]);
    if (top) {
      const list = wonBy.get(top.playerId) ?? [];
      list.push(cardId);
      wonBy.set(top.playerId, list);
    }
  }

  // Check players in seat order from the round's first player.
  const n = state.players.length;
  for (let step = 0; step < n; step++) {
    const player = state.players[(state.firstPlayerSeat + step) % n];
    const won = wonBy.get(player.id) ?? [];
    if (won.length > MAX_PURCHASES_PER_AUCTION_PHASE) {
      auction.pendingChoice = { playerId: player.id, wonCards: won };
      return;
    }
  }

  // Stable: award every card to its high bidder at their bid amount.
  for (const cardId of auction.cards) {
    const top = highestBid(auction.bids[cardId]);
    if (top) {
      giveCard(state, top.playerId, cardId, top.amount);
    } else {
      state.discard.push(cardId);
    }
  }
  endAuctionPhase(state);
}

function handleChooseWinnings(
  state: GameState,
  playerId: PlayerId,
  chosen: CollectibleId[],
): string | null {
  const auction = getGrandAuction(state);
  if (!auction?.pendingChoice) return "There is nothing to choose right now.";
  const { pendingChoice } = auction;
  if (pendingChoice.playerId !== playerId) return "It is not your choice to make.";
  if (
    chosen.length !== MAX_PURCHASES_PER_AUCTION_PHASE ||
    new Set(chosen).size !== chosen.length ||
    !chosen.every((id) => pendingChoice.wonCards.includes(id))
  ) {
    return `Choose exactly ${MAX_PURCHASES_PER_AUCTION_PHASE} of the collectibles you won.`;
  }

  // Withdraw the player's bids from relinquished cards so the second-highest
  // bidder becomes the winner (at their own bid amount) on re-resolution.
  for (const cardId of pendingChoice.wonCards) {
    if (!chosen.includes(cardId)) {
      auction.bids[cardId] = auction.bids[cardId].filter((b) => b.playerId !== playerId);
    }
  }
  auction.pendingChoice = null;
  resolveGrandAuction(state, auction);
  return null;
}

// ---------------------------------------------------------------------------
// Market phase
// ---------------------------------------------------------------------------

function handleSell(state: GameState, playerId: PlayerId, cardId: CollectibleId): string | null {
  if (state.phase !== "market") return "You can only sell during the Market Phase.";
  if (state.marketDone.includes(playerId)) return "You have already finished selling.";

  const player = state.players.find((p) => p.id === playerId)!;
  const index = player.collection.findIndex((c) => c.id === cardId);
  if (index === -1) return "You do not own that collectible.";

  const owned = player.collection[index];
  const price = currentValue(owned, player, state.players);
  player.collection.splice(index, 1);
  player.cash += price;
  state.discard.push(owned.id);
  return null;
}

function handleMarketDone(state: GameState, playerId: PlayerId): string | null {
  if (state.phase !== "market") return "The Market Phase is not in progress.";
  if (state.marketDone.includes(playerId)) return "You are already done.";

  state.marketDone.push(playerId);
  if (state.marketDone.length === state.players.length) {
    endRound(state);
  }
  return null;
}
