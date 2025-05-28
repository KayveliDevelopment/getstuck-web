import { Card, GameState, Point } from "./gameTypes";

const suits = ["hearts", "diamonds", "clubs", "spades"] as const;

function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (let val = 1; val <= 13; val++) {
      if (val === 10) continue; // skip 10 like in original
      deck.push({
        val,
        suit,
        isRed: suit === "hearts" || suit === "diamonds",
        flipped: false,
      });
    }
  }
  return deck;
}

export function initBoard(): GameState {
  const size = 7;
  const deck = generateDeck();
  const board: (Card | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );
  const emptySlot: Point = { x: Math.floor(size / 2), y: Math.floor(size / 2) };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x === emptySlot.x && y === emptySlot.y) continue;
      const index = Math.floor(Math.random() * deck.length);
      board[y][x] = deck.splice(index, 1)[0];
    }
  }

  return {
    board,
    emptySlot,
    turn: 1,
  };
}
