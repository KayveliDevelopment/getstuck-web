import { Card, GameState, Point } from "./gameTypes";

export function cloneBoard(board: (Card | null)[][]): (Card | null)[][] {
  return board.map(row => row.map(card => card ? { ...card } : null));
}

export function isValidMove(from: Point, to: Point, board: (Card | null)[][]): boolean {
  if (from.x === to.x && from.y === to.y) return false;

  const card = board[to.y][to.x];
  if (!card) return false;

  const dx = from.x - to.x;
  const dy = from.y - to.y;

  const isStraight = dx === 0 || dy === 0;
  const isDiagonal = Math.abs(dx) === Math.abs(dy);

  if (!(isStraight || isDiagonal)) return false;

  if (card.val > 10) return true;

  const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
  const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

  let x = to.x + stepX;
  let y = to.y + stepY;

  while (x !== from.x || y !== from.y) {
    if (board[y][x]?.flipped) return false;
    x += stepX;
    y += stepY;
  }

  return true;
}

export function getAvailableMoves(
  player: 1 | 2,
  emptySlot: Point,
  board: (Card | null)[][]
): Point[] {
  const isRed = player === 1;
  const moves: Point[] = [];
  const directions = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 }
  ];

  for (const { dx, dy } of directions) {
    let x = emptySlot.x + dx;
    let y = emptySlot.y + dy;
    while (x >= 0 && y >= 0 && y < board.length && x < board[0].length) {
      const card = board[y][x];
      if (card && !card.flipped && card.isRed === isRed && isValidMove(emptySlot, { x, y }, board)) {
        moves.push({ x, y });
      }
      x += dx;
      y += dy;
    }
  }

  return moves;
}

export function getDiagonalMoves(
  player: 1 | 2,
  emptySlot: Point,
  board: (Card | null)[][]
): Point[] {
  const isRed = player === 1;
  const moves: Point[] = [];
  const diagonals = [
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: -1 }
  ];

  for (const { dx, dy } of diagonals) {
    let x = emptySlot.x + dx;
    let y = emptySlot.y + dy;
    while (x >= 0 && y >= 0 && y < board.length && x < board[0].length) {
      const card = board[y][x];
      if (card && !card.flipped && card.isRed === isRed && isValidMove(emptySlot, { x, y }, board)) {
        moves.push({ x, y });
      }
      x += dx;
      y += dy;
    }
  }

  return moves;
}

export function makeMove(move: Point, game: GameState): GameState {
  const { x, y } = move;
  const { board, emptySlot, turn } = game;

  const newBoard = board.map(row => row.slice());
  const card = newBoard[y][x];
  if (!card) return game; // Safety

  // Move card to empty slot and flip it
  newBoard[emptySlot.y][emptySlot.x] = { ...card, flipped: true };
  newBoard[y][x] = null;

  return {
    ...game,
    board: newBoard,
    emptySlot: { x, y },
    turn: turn === 1 ? 2 : 1,
  };
}
export function evaluateBoard(board: (Card | null)[][], emptySlot: Point, turn: number): number {
  // Example: count number of cards owned by the current player
  let score = 0;
  for (const row of board) {
    for (const card of row) {
      if (card) {
        if (turn === 1 && card.isRed) score++;
        if (turn === 2 && !card.isRed) score++;
      }
    }
  }
  return score;
}

export function checkGameOver(
  board: (Card | null)[][],
  emptySlot: Point
): 0 | 1 | -1 {
  const redMoves = getAvailableMoves(1, emptySlot, board);
  if (redMoves.length === 0) redMoves.push(...getDiagonalMoves(1, emptySlot, board));

  const blackMoves = getAvailableMoves(2, emptySlot, board);
  if (blackMoves.length === 0) blackMoves.push(...getDiagonalMoves(2, emptySlot, board));

  if (redMoves.length === 0) return -1;
  if (blackMoves.length === 0) return 1;
  return 0;
}
