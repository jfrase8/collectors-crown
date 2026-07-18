import { currentValue, type GamePlayer } from "@collectors-crown/shared"
import { CardWithDetails } from "./card-with-details"

interface CollectionGridProps {
  owner: GamePlayer
  allPlayers: readonly GamePlayer[]
}

export function CollectionGrid({ owner, allPlayers }: CollectionGridProps) {
  if (owner.collection.length === 0) {
    return <p className="text-secondary italic">No collectibles yet.</p>
  }
  return (
    <ul className="flex flex-wrap gap-3">
      {owner.collection.map((owned) => (
        <li key={owned.id}>
          <CardWithDetails
            cardId={owned.id}
            currentValue={currentValue(owned, owner, allPlayers)}
          />
        </li>
      ))}
    </ul>
  )
}
