import { Card, GameState, Point } from "./gameTypes";
import {
  getAvailableMoves,
  getDiagonalMoves,
  makeMove,
  evaluateBoard,
} from "./moveLogic";

/* ------------------------------------------------------------------ */
/*  TYPES / DEBUG INFO                                                */
/* ------------------------------------------------------------------ */
export type MinimaxDebugInfo = {
  depth: number;          // max depth actually reached
  nodesEvaluated: number;
  pruned: number;
  bestMove: Point;
};

type DebugCallbacks = {
  onEvaluate?: () => void;
  onPrune?: () => void;
};

/* ------------------------------------------------------------------ */
/*  TRANSPOSITION-TABLE CACHE                                         */
/* ------------------------------------------------------------------ */
type CacheEntry = { score: number; depth: number };
const transTable = new Map<string, CacheEntry>();

function boardHash(board: (Card | null)[][]): string {
  // compact 1-line string; '.' for empty, otherwise v+s+f
  return board
    .map((row) =>
      row
        .map((c) =>
          c
            ? `${c.val.toString(16)}${c.suit[0]}${c.flipped ? "1" : "0"}`
            : "."
        )
        .join("")
    )
    .join("");
}

function makeTTKey(game: GameState, maximizing: boolean): string {
  return (
    boardHash(game.board) +
    "|" +
    game.emptySlot.x +
    "," +
    game.emptySlot.y +
    "|" +
    game.turn +
    "|" +
    (maximizing ? "1" : "0")
  );
}

/* ------------------------------------------------------------------ */
/*  CORE MINIMAX WITH ALPHA-BETA + CACHE                              */
/* ------------------------------------------------------------------ */
export function runMinimax(
  game: GameState,
  depth: number,
  maximizingPlayer: boolean,
  debug?: DebugCallbacks,
  alpha: number = -Infinity,
  beta: number = Infinity
): { move: Point; score: number } {
  // ---- TT lookup ----
  const key = makeTTKey(game, maximizingPlayer);
  const cached = transTable.get(key);
  if (cached && cached.depth >= depth) {
    // reuse value if cached search was at least as deep
    debug?.onEvaluate?.();
    return { move: game.emptySlot, score: cached.score };
  }

  // ---- generate moves ----
  const turn = game.turn;
  const moves = [
    ...getAvailableMoves(turn, game.emptySlot, game.board),
    ...getDiagonalMoves(turn, game.emptySlot, game.board),
  ];

  // ---- terminal node or depth-0 ----
  if (depth === 0 || moves.length === 0) {
    debug?.onEvaluate?.();
    const score = evaluateBoard(game.board, game.emptySlot, turn);
    transTable.set(key, { score, depth });
    return { move: game.emptySlot, score };
  }

  // ---- recurse ----
  let bestMove = moves[0];
  let bestScore = maximizingPlayer ? -Infinity : Infinity;

  for (const move of moves) {
    const newGame = makeMove(move, game);
    const res = runMinimax(
      newGame,
      depth - 1,
      !maximizingPlayer,
      debug,
      alpha,
      beta
    );

    if (maximizingPlayer) {
      if (res.score > bestScore) {
        bestScore = res.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (res.score < bestScore) {
        bestScore = res.score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) {
      debug?.onPrune?.();
      break; // alpha-beta pruning
    }
  }

  transTable.set(key, { score: bestScore, depth });
  return { move: bestMove, score: bestScore };
}

/* ------------------------------------------------------------------ */
/*  ITERATIVE-DEEPENING WRAPPER (with 2 s budget)                     */
/* ------------------------------------------------------------------ */
function runMinimaxIterativeWithStats(
  game: GameState,
  maxDepth: number,
  maximizingPlayer: boolean,
  timeBudgetMs = 2000
): { move: Point; stats: MinimaxDebugInfo } {
  const startTime = performance.now();

  let bestMove: Point = game.emptySlot;
  let bestDepthReached = 0;
  let nodesEvaluated = 0;
  let pruned = 0;

  for (let d = 1; d <= maxDepth; d++) {
    const res = runMinimax(game, d, maximizingPlayer, {
      onEvaluate: () => nodesEvaluated++,
      onPrune: () => pruned++,
    });

    bestMove = res.move;
    bestDepthReached = d;

    if (performance.now() - startTime > timeBudgetMs) break; // ⏳ out of time
  }

  return {
    move: bestMove,
    stats: {
      depth: bestDepthReached,
      nodesEvaluated,
      pruned,
      bestMove,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  PUBLIC API USED BY GameBoard                                      */
/* ------------------------------------------------------------------ */
export function runMinimaxWithStats(
  game: GameState,
  depth: number,
  maximizingPlayer: boolean
): { move: Point; stats: MinimaxDebugInfo } {
  // For depths > 8 (Hard+) we switch to iterative deepening with a 2-second cap
  if (depth > 8) {
    return runMinimaxIterativeWithStats(game, depth, maximizingPlayer, 2000);
  }

  // --- unchanged behaviour for Easy / Intermediate / Hard ---
  let nodesEvaluated = 0;
  let pruned = 0;

  const { move } = runMinimax(game, depth, maximizingPlayer, {
    onEvaluate: () => nodesEvaluated++,
    onPrune: () => pruned++,
  });

  return {
    move,
    stats: {
      depth,
      nodesEvaluated,
      pruned,
      bestMove: move,
    },
  };
}
