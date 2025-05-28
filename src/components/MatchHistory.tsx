"use client";

import { useEffect, useState } from "react";
import { getHistory, clearHistory, GameResult } from "@/lib/scoreManager";

export default function MatchHistory() {
  const [history, setHistory] = useState<GameResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  return (
    <section className="text-white max-w-md w-full mt-6 space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Match History</h2>
        <button
          className="text-sm underline text-red-400"
          onClick={() => {
            clearHistory();
            setHistory([]);
          }}
        >
          Clear
        </button>
      </div>
      {history.length === 0 ? (
        <p className="text-gray-400 text-sm">No games played yet.</p>
      ) : (
        <ul className="text-sm space-y-1">
          {history.map((game, i) => (
            <li key={i}>
              {game.timestamp.slice(0, 19).replace("T", " ")} —{" "}
              <span className="font-bold text-red-300">{game.winner}</span> wins
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
