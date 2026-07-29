/**
 * Per-seat accent colors, assigned by seat order. Used anywhere a player needs
 * a recognizable color (e.g. the frame of a card they bought).
 */
export const PLAYER_COLORS: readonly string[] = [
  "oklch(0.82 0.14 100)", // yellow
  "oklch(0.72 0.11 230)", // azure
  "oklch(0.7 0.12 145)", // emerald
  "oklch(0.63 0.22 27)", // red
  "oklch(0.7 0.11 310)", // violet
]

export function playerColor(seat: number): string {
  return PLAYER_COLORS[seat % PLAYER_COLORS.length]
}
