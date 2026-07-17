import type { PlayerId } from "../types.js";

export type Tier = 1 | 2 | 3;

/**
 * Every collectible has exactly one trait; only that trait's bonus applies
 * to it on top of printed value. Appreciation is itself a trait, not a
 * universal rule — only `appreciation` cards gain value each round.
 */
export type TraitId = "appreciation" | "collection" | "set" | "rarity" | "pairing";

export type Category = "Coins" | "Stamps" | "Paintings" | "Watches" | "Comics" | "Relics";

export type CollectibleId = string;
export type SetId = string;
export type CharacterId = string;

/** Static card definition. Immutable; lives in the shared card catalog. */
export interface CollectibleDefinition {
  id: CollectibleId;
  name: string;
  tier: Tier;
  category: Category;
  trait: TraitId;
  printedValue: number;
  historicalDescription: string;
  traitDescription: string;
  /** Only on `set` trait cards: the 3-card set this belongs to. */
  setId?: SetId;
  /** Only on `pairing` trait cards: the category that triggers the bonus. */
  pairedCategory?: Category;
}

/** Per-game mutable state of a card in play. */
export interface CollectibleState {
  id: CollectibleId;
  /** Accumulated appreciation; tracked separately from printedValue. */
  currentAppreciation: number;
}

export interface Character {
  id: CharacterId;
  name: string;
  description: string;
  /**
   * Passive ability hook point. Abilities are not implemented yet; this key
   * will select an ability implementation from a registry later.
   */
  abilityId: string | null;
}

export type RoundPhase = "auction" | "market" | "finished";

export interface GamePlayer {
  id: PlayerId;
  name: string;
  characterId: CharacterId;
  cash: number;
  /** Owned cards, by state (definition looked up from the catalog). */
  collection: CollectibleState[];
  connected: boolean;
}

/** Outcome of one auctioned lot, kept for the phase's on-screen history. */
export interface StandardLotResult {
  cardId: CollectibleId;
  /** null when every player passed and the lot was discarded. */
  winnerId: PlayerId | null;
  price: number | null;
}

/** Standard auction: one card on the block at a time, turn-based bidding. */
export interface StandardAuctionState {
  kind: "standard";
  /** Cards revealed this phase but not yet auctioned (next up first). */
  queue: CollectibleId[];
  /** The card currently being bid on. */
  current: CollectibleId | null;
  highBid: number | null;
  highBidder: PlayerId | null;
  /** Players who passed on the current card (cannot bid again on it). */
  passed: PlayerId[];
  /** Subset of `passed` forced out because they could not cover the bid. */
  autoPassed: PlayerId[];
  /** Seat index of the player whose turn it is to bid or pass. */
  turnSeat: number;
  /** Lots already auctioned this phase, oldest first. */
  results: StandardLotResult[];
}

export interface GrandBid {
  playerId: PlayerId;
  amount: number;
  /** Global ordering; earlier bids win ties. */
  seq: number;
}

/** Grand auction: all cards face up, five bid actions per player. */
export interface GrandAuctionState {
  kind: "grand";
  cards: CollectibleId[];
  /** All bids per card, latest per player kept (superseded bids removed). */
  bids: Record<CollectibleId, GrandBid[]>;
  bidsRemaining: Record<PlayerId, number>;
  /** Players who passed with bids remaining (done for the phase). */
  passed: PlayerId[];
  turnSeat: number;
  nextSeq: number;
  /**
   * Set during resolution when a player won more than two cards and must
   * choose which two to keep. Blocks the game until resolved.
   */
  pendingChoice: { playerId: PlayerId; wonCards: CollectibleId[] } | null;
}

export type AuctionState = StandardAuctionState | GrandAuctionState;

export interface FinalScore {
  playerId: PlayerId;
  cash: number;
  collectionValue: number;
  netWorth: number;
}

export interface GameState {
  gameId: string;
  seed: number;
  /** Seat order; index = seat. */
  players: GamePlayer[];
  round: number;
  phase: RoundPhase;
  /** Seat index of the round's first player; rotates each round. */
  firstPlayerSeat: number;
  auction: AuctionState | null;
  /** Purchases made this auction phase, for the 2-per-phase cap. */
  purchasesThisPhase: Record<PlayerId, number>;
  /** Remaining cards in each tier deck (top of deck first). Hidden from clients. */
  decks: Record<Tier, CollectibleId[]>;
  discard: CollectibleId[];
  /** Players done selling in the current market phase. */
  marketDone: PlayerId[];
  /** Present only when phase === "finished". */
  finalScores: FinalScore[] | null;
  /** Monotonic action counter, for client ordering/optimistic checks. */
  version: number;
}

/** What clients see. Decks are hidden (only counts are public). */
export interface GameSnapshot extends Omit<GameState, "decks" | "seed"> {
  deckCounts: Record<Tier, number>;
}

export type GameAction =
  | { type: "bid"; amount: number }
  | { type: "pass" }
  | { type: "grand_bid"; collectibleId: CollectibleId; amount: number }
  | { type: "grand_pass" }
  | { type: "choose_winnings"; collectibleIds: CollectibleId[] }
  | { type: "sell"; collectibleId: CollectibleId }
  | { type: "market_done" };

export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string };
