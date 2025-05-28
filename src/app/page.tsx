"use client";

import { useCallback, useState } from "react";
import Controls from "@/components/Controls";
import GameBoard from "@/components/GameBoard";
import MatchHistory from "@/components/MatchHistory";
import { GameState } from "@/lib/gameTypes";
import { fadeOutMusic } from "@/lib/musicController";
import { saveGame } from "@/lib/scoreManager";
export default function Page() {
  const [mode, setMode] = useState<"vs-ai" | "ai-vs-ai" | "local">("vs-ai");
  const [redDepth, setRedDepth] = useState(2);
  const [blackDepth, setBlackDepth] = useState(2);
  const [resetKey, setResetKey] = useState(0);
  const [game, setGame] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"red" | "black" | "draw" | null>(null);

  const handleStart = useCallback(() => {
    setResetKey((key) => key + 1);
    setGameOver(false);
    setWinner(null);
  }, []);

  const handleRestart = useCallback(() => {
    setResetKey((key) => key + 1);
    setGameOver(false);
    setWinner(null);
  }, []);

  const handleConcede = useCallback(() => {
    if (!game || gameOver) return;
    const winningSide = game.turn === 1 ? "black" : "red";
    handleGameEnd(winningSide);
  }, [game, gameOver]);

  const handleGameUpdate = useCallback((state: GameState) => {
    setGame(state);
  }, []);

 const handleGameEnd = useCallback((win: "red" | "black" | "draw") => {
  fadeOutMusic();
  setGameOver(true);
  setWinner(win);
  saveGame({ winner: win, timestamp: new Date().toISOString() });
  setGame(null);
  // 🔥  NO automatic reset / no setTimeout
}, []);

  return (
    <div className="min-h-screen bg-[#500f22] flex flex-col items-center">
      <img
  src="/banner.png"
  alt="Get Stuck Banner"
  className="mt-0 mb-12 w-[600px] max-w-full h-auto drop-shadow-lg select-none"
/>

      <Controls
        mode={mode}
        setMode={setMode}
        redDepth={redDepth}
        setRedDepth={setRedDepth}
        blackDepth={blackDepth}
        setBlackDepth={setBlackDepth}
        onStart={handleStart}
        onRestart={handleRestart}
        onConcede={handleConcede}
        gameStarted={!!game}
        gameOver={gameOver}
      />

      <div className="mb-2 text-center min-h-[40px]">
        {gameOver ? (
          <span className="text-yellow-400 text-3xl font-extrabold drop-shadow">
            {winner === "draw"
              ? "Game Over: Draw!"
              : winner
              ? `${winner === "red" ? "Red" : "Black"} player wins!`
              : ""}
          </span>
        ) : (
          <span className="text-yellow-300 text-2xl font-bold">
            Turn: {game?.turn === 1 ? "Red" : game?.turn === 2 ? "Black" : ""}
          </span>
        )}
      </div>

      <GameBoard
        key={resetKey}
        resetKey={resetKey}
        mode={mode}
        redDepth={redDepth}
        blackDepth={blackDepth}
        gameOver={gameOver}
        onGameUpdate={handleGameUpdate}
        onGameEnd={handleGameEnd}
      />

      <MatchHistory />
    </div>
  );
}
