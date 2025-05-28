import React from "react";

type ControlsProps = {
  mode: "vs-ai" | "ai-vs-ai" | "local";
  setMode: (m: "vs-ai" | "ai-vs-ai" | "local") => void;
  redDepth: number;
  setRedDepth: (n: number) => void;
  blackDepth: number;
  setBlackDepth: (n: number) => void;
  onStart: () => void;
  onRestart: () => void;
  onConcede: () => void;
  gameStarted: boolean;
  gameOver: boolean;
};

const difficultyOptions = [
  { label: "Easy", value: 1 },
  { label: "Intermediate", value: 3 },
  { label: "Hard", value: 8 },
  { label: "Extreme", value: 12 },
];

export default function Controls({
  mode,
  setMode,
  redDepth,
  setRedDepth,
  blackDepth,
  setBlackDepth,
  onStart,
  onRestart,
  onConcede,
  gameStarted,
  gameOver,
}: ControlsProps) {
  return (
    <div className="bg-yellow-700 bg-opacity-90 rounded-lg p-6 flex flex-col items-center mb-4 min-w-[420px]">
      <h2 className="text-3xl font-gothic text-center text-yellow-100 mb-2">
        Game Mode
      </h2>
      <div className="flex flex-row gap-5 mb-4">
        <button
          className={`font-bold text-xl px-4 py-2 rounded transition-all ${
            mode === "vs-ai"
              ? "bg-yellow-200 text-yellow-900"
              : "bg-yellow-700 text-yellow-100 hover:bg-yellow-600"
          }`}
          onClick={() => setMode("vs-ai")}
        >
          Player VS A.I
        </button>
        <button
          className={`font-bold text-xl px-4 py-2 rounded transition-all ${
            mode === "ai-vs-ai"
              ? "bg-yellow-200 text-yellow-900"
              : "bg-yellow-700 text-yellow-100 hover:bg-yellow-600"
          }`}
          onClick={() => setMode("ai-vs-ai")}
        >
          AI V AI
        </button>
        <button
          className={`font-bold text-xl px-4 py-2 rounded transition-all ${
            mode === "local"
              ? "bg-yellow-200 text-yellow-900"
              : "bg-yellow-700 text-yellow-100 hover:bg-yellow-600"
          }`}
          onClick={() => setMode("local")}
        >
          Play Locally
        </button>
      </div>
      <div className="flex flex-row items-center gap-6 mb-3">
        <span className="font-bold text-2xl text-yellow-100">Difficulty</span>
        {mode === "ai-vs-ai" && (
          <>
            <select
              value={redDepth}
              className="rounded p-1 text-lg font-semibold text-red-700"
              onChange={(e) => setRedDepth(Number(e.target.value))}
            >
              {difficultyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Red: {opt.label}
                </option>
              ))}
            </select>
            <select
              value={blackDepth}
              className="rounded p-1 text-lg font-semibold text-black"
              onChange={(e) => setBlackDepth(Number(e.target.value))}
            >
              {difficultyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Black: {opt.label}
                </option>
              ))}
            </select>
          </>
        )}
        {mode === "vs-ai" && (
          <select
            value={blackDepth}
            className="rounded p-1 text-lg font-semibold text-black"
            onChange={(e) => setBlackDepth(Number(e.target.value))}
          >
            {difficultyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                AI: {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex flex-row gap-5 mt-2">
        <button
          className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-all"
          onClick={onStart}
        >
          Start Game
        </button>
        <button
          className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-6 rounded transition-all"
          onClick={onRestart}
        >
          Restart
        </button>
      </div>

      {gameStarted && !gameOver && (
        <button
          onClick={onConcede}
          className="mt-4 bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-6 rounded"
        >
          Concede
        </button>
      )}
    </div>
  );
}
