import type { Character, CharacterId } from "./types.js";

// Placeholder characters. Each will grant one passive ability; abilities are
// not implemented yet. When they are, `abilityId` selects an implementation
// from an ability registry (hooks into engine events like income, bidding,
// valuation) so no engine code has to special-case characters.

export const CHARACTERS: readonly Character[] = [
  {
    id: "curator",
    name: "The Curator",
    description: "A museum veteran with an eye for complete sets.",
    abilityId: null,
  },
  {
    id: "tycoon",
    name: "The Tycoon",
    description: "Old money. Deep pockets. Deeper grudges.",
    abilityId: null,
  },
  {
    id: "appraiser",
    name: "The Appraiser",
    description: "Knows what everything is worth — especially to someone else.",
    abilityId: null,
  },
  {
    id: "smuggler",
    name: "The Smuggler",
    description: "Acquires pieces through channels best left undescribed.",
    abilityId: null,
  },
  {
    id: "historian",
    name: "The Historian",
    description: "Sees the connections between artifacts others miss.",
    abilityId: null,
  },
];

const byId = new Map(CHARACTERS.map((c) => [c.id, c]));

export function getCharacter(id: CharacterId): Character {
  const character = byId.get(id);
  if (!character) throw new Error(`Unknown character id: ${id}`);
  return character;
}
