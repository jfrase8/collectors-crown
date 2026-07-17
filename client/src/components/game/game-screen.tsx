import {
  TIER_CONFIG,
  tierForRound,
  TIER_NAMES,
  TOTAL_ROUNDS,
  type GameAction,
  type GameSnapshot,
  type PlayerId,
} from "@collectors-crown/shared"
import { useEffect, useRef, useState } from "react"
import { formatMoney } from "../../lib/format"
import { socket } from "../../lib/socket"
import { useGameStore } from "../../stores/game-store"
import { AuctionStage } from "./auction-stage"
import { CardWithDetails } from "./card-with-details"
import { CollectionGrid } from "./collection-grid"
import { Drawer } from "./drawer"
import {
  bottomBar,
  cashLabel,
  cashValue,
  errorLine,
  eyebrow,
  header,
  screen,
  tierTitle,
} from "./game-screen.styles"
import { GrandAuctionStage } from "./grand-auction-stage"
import { CollectionIcon, DiscardIcon, PlayersIcon } from "./icons"
import { MarketPanel } from "./market-panel"
import { PhaseInterstitial, type Interstitial } from "./phase-interstitial"
import { PlayersPanel } from "./players-panel"
import { ScoresPanel } from "./scores-panel"
import { TurnRibbon } from "./turn-ribbon"

interface GameScreenProps {
  myPlayerId: PlayerId
}

export function GameScreen({ myPlayerId }: GameScreenProps) {
  const game = useGameStore((s) => s.game)
  const setGame = useGameStore((s) => s.setGame)
  const [error, setError] = useState<string | null>(null)
  const [interstitial, setInterstitial] = useState<Interstitial | null>(null)
  const prevGame = useRef<GameSnapshot | null>(null)

  useEffect(() => {
    // Hydrate on mount in case the game:state broadcast was missed.
    if (!useGameStore.getState().game) {
      socket.emit("game:get_state", (state) => {
        if (state) setGame(state)
      })
    }
  }, [setGame])

  useEffect(() => {
    const prev = prevGame.current
    prevGame.current = game
    if (!prev || !game || prev.gameId !== game.gameId || prev.version >= game.version) return

    if (prev.phase === "auction" && game.phase === "market") {
      setInterstitial({
        kind: "income",
        round: game.round,
        amount: TIER_CONFIG[tierForRound(game.round)].income,
      })
    } else if (prev.phase === "market" && game.phase === "auction" && game.round === prev.round + 1) {
      const prevMe = prev.players.find((p) => p.id === myPlayerId)
      const me = game.players.find((p) => p.id === myPlayerId)
      const gains =
        me?.collection.flatMap((owned) => {
          const before = prevMe?.collection.find((c) => c.id === owned.id)
          const gained = owned.currentAppreciation - (before?.currentAppreciation ?? 0)
          return before && gained > 0 ? [{ cardId: owned.id, gained }] : []
        }) ?? []
      if (gains.length > 0) {
        setInterstitial({ kind: "appreciation", round: prev.round, gains })
      }
    }
  }, [game, myPlayerId])

  if (!game) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-secondary italic">Taking your seat…</p>
      </main>
    )
  }

  const me = game.players.find((p) => p.id === myPlayerId)
  if (!me) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-secondary">You are not seated at this game.</p>
      </main>
    )
  }

  function send(action: GameAction) {
    setError(null)
    socket.emit("game:action", action, (res) => {
      if (!res.ok) setError(res.error)
    })
  }

  const tier = tierForRound(game.round)

  return (
    <main className={screen()}>
      <header className={header()}>
        <p className={eyebrow()}>
          Round {game.round} of {TOTAL_ROUNDS}
        </p>
        <h1 className={tierTitle()}>{TIER_NAMES[tier]}</h1>
        <TurnRibbon game={game} myPlayerId={myPlayerId} />
      </header>

      {error && <p className={errorLine()}>{error}</p>}

      {game.phase === "auction" && game.auction?.kind === "standard" && (
        <AuctionStage game={game} auction={game.auction} myPlayerId={myPlayerId} send={send} />
      )}
      {game.phase === "auction" && game.auction?.kind === "grand" && (
        <GrandAuctionStage game={game} auction={game.auction} myPlayerId={myPlayerId} send={send} />
      )}
      {game.phase === "market" && <MarketPanel game={game} myPlayerId={myPlayerId} send={send} />}
      {game.phase === "finished" && <ScoresPanel game={game} myPlayerId={myPlayerId} />}

      <footer className={bottomBar()}>
        <div>
          <p className={cashLabel()}>Your funds</p>
          <p className={cashValue()}>{formatMoney(me.cash)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Drawer icon={<CollectionIcon />} title="Your collection" badge={me.collection.length}>
            <CollectionGrid owner={me} allPlayers={game.players} />
          </Drawer>
          <Drawer icon={<PlayersIcon />} title="Players">
            <PlayersPanel game={game} myPlayerId={myPlayerId} />
          </Drawer>
          <Drawer icon={<DiscardIcon />} title="Discard pile" badge={game.discard.length}>
            {game.discard.length === 0 ? (
              <p className="text-secondary/70 italic">Nothing has been discarded.</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {game.discard.map((cardId) => (
                  <li key={cardId}>
                    <CardWithDetails cardId={cardId} />
                  </li>
                ))}
              </ul>
            )}
          </Drawer>
        </div>
      </footer>

      {interstitial && (
        <PhaseInterstitial interstitial={interstitial} onDone={() => setInterstitial(null)} />
      )}
    </main>
  )
}
