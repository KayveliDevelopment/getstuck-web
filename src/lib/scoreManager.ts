import { GameState } from "./gameTypes";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */
export type ScoreBreakdown = {
  numerals: number; // sum of A(1)‑9 values
  courts: number;   // count of J,Q,K still face‑up
};

export type Scores = {
  red: number;
  black: number;
  redBreakdown: ScoreBreakdown;
  blackBreakdown: ScoreBreakdown;
};

/* ------------------------------------------------------------------ */
/*  RAW TALLY (no winner applied)                                     */
/* ------------------------------------------------------------------ */
export function calculateScores(game: GameState): Scores {
  let redNumerals = 0;
  let blackNumerals = 0;
  let redCourts = 0;
  let blackCourts = 0;

  for (const row of game.board) {
    for (const card of row) {
      if (!card || card.flipped) continue; // ignore faced‑down cards

      if (card.val === 1) {
        card.isRed ? redNumerals++ : blackNumerals++;
      } else if (card.val >= 2 && card.val <= 9) {
        card.isRed ? (redNumerals += card.val) : (blackNumerals += card.val);
      } else {
        // J, Q, K  → court
        card.isRed ? redCourts++ : blackCourts++;
      }
    }
  }

  return {
    red: redNumerals + redCourts * 10,
    black: blackNumerals + blackCourts * 10,
    redBreakdown: { numerals: redNumerals, courts: redCourts },
    blackBreakdown: { numerals: blackNumerals, courts: blackCourts },
  };
}

/* ------------------------------------------------------------------ */
/*  FINAL SCORING (+10 / –10 COURT RULE)                              */
/* ------------------------------------------------------------------ */
export function finaliseScores(
  raw: Scores,
  winner: "red" | "black"
): Scores {
  const redTotal =
    raw.redBreakdown.numerals +
    raw.redBreakdown.courts * (winner === "red" ? 10 : -10);

  const blackTotal =
    raw.blackBreakdown.numerals +
    raw.blackBreakdown.courts * (winner === "black" ? 10 : -10);

  return {
    red: redTotal,
    black: blackTotal,
    redBreakdown: raw.redBreakdown,
    blackBreakdown: raw.blackBreakdown,
  };
}

/** Convenience – compute final scores directly from a game state */
export function computeFinalScores(
  game: GameState,
  winner: "red" | "black"
): Scores {
  return finaliseScores(calculateScores(game), winner);
}

/* ------------------------------------------------------------------ */
/*  LOCAL STORAGE HISTORY                                             */
/* ------------------------------------------------------------------ */
export type GameResult = {
  winner: "red" | "black" | "draw";
  timestamp: string;
};

const STORAGE_KEY = "getstuck_history";

export function getHistory(): GameResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGame(result: GameResult): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();
    const updated = [result, ...history].slice(0, 50); // keep 50 latest
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* silent */
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
