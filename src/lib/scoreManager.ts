import { GameState } from "./gameTypes";

export type ScoreBreakdown = {
  numerals: number;
  courts: number;
};

export type Scores = {
  red: number;
  black: number;
  redBreakdown: ScoreBreakdown;
  blackBreakdown: ScoreBreakdown;
};

export function calculateScores(game: GameState): Scores {
  let redNumerals = 0;
  let blackNumerals = 0;
  let redCourts = 0;
  let blackCourts = 0;

  for (const row of game.board) {
    for (const card of row) {
      if (!card || card.flipped) continue;

      if (card.val === 1) {
        if (card.isRed) {
          redNumerals++;
        } else {
          blackNumerals++;
        }
      } else if (card.val >= 2 && card.val <= 9) {
        if (card.isRed) {
          redNumerals += card.val;
        } else {
          blackNumerals += card.val;
        }
      } else {
        if (card.isRed) {
          redCourts++;
        } else {
          blackCourts++;
        }
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

export function finaliseScores(raw: Scores, winner: "red" | "black"): Scores {
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

export function computeFinalScores(game: GameState, winner: "red" | "black"): Scores {
  return finaliseScores(calculateScores(game), winner);
}

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
    const updated = [result, ...history].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silent fail
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail
  }
}
