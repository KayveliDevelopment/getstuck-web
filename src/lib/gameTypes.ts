export type Card = {
  val: number;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  isRed: boolean;
  flipped: boolean;
};

export type Point = {
  x: number;
  y: number;
};

export type GameState = {
  board: (Card | null)[][];
  emptySlot: Point;
  turn: 1 | 2;
};
