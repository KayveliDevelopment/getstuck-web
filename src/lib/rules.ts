import { GameState, Point } from "./gameTypes";
import { getAvailableMoves, getDiagonalMoves } from "./moveLogic";

/**
 * Returns only valid moves based on the game rules:
 * - If any horizontal/vertical move is available, return only those.
 * - Only if none exist, return diagonal moves.
 */
export function getLegalMoves(state: GameState): Point[] {
  const hvMoves = getAvailableMoves(state.turn, state.emptySlot, state.board);
  if (hvMoves.length > 0) {
    return hvMoves;
  }

  const diagMoves = getDiagonalMoves(state.turn, state.emptySlot, state.board);
  return diagMoves;
}
