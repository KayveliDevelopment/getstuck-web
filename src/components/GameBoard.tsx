"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getLegalMoves } from "@/lib/rules";
import { Card, GameState } from "@/lib/gameTypes";
import { initBoard } from "@/lib/initBoard";
import {
  makeMove,
  getAvailableMoves,
  getDiagonalMoves,
  checkGameOver,
} from "@/lib/moveLogic";
import { runMinimaxWithStats, MinimaxDebugInfo } from "@/lib/minimax";
import {
  initMusic,
  playMusic,
  toggleMute,
  isMusicMuted,
} from "@/lib/musicController";
import { calculateScores, computeFinalScores } from "@/lib/scoreManager";

const randomAIDelay = () => 500 + Math.random() * 1500;
const CARD_WIDTH = 82;
const CARD_HEIGHT = 118;

type GameBoardProps = {
  resetKey?: number;
  mode: "vs-ai" | "ai-vs-ai" | "local";
  redDepth: number;
  blackDepth: number;
  onGameEnd?: (winner: "red" | "black" | "draw") => void;
  onGameUpdate?: (state: GameState) => void;
  gameOver?: boolean;
};

export default function GameBoard({
  resetKey,
  mode,
  redDepth,
  blackDepth,
  onGameEnd,
  onGameUpdate,
  gameOver,
}: GameBoardProps) {
  const [game, setGame] = useState<GameState | null>(null);
  const [debugStats, setDebugStats] = useState<MinimaxDebugInfo | null>(null);
  const [musicMuted, setMusicMuted] = useState(isMusicMuted());
  const [scores, setScores] = useState<ReturnType<typeof calculateScores> | null>(null);
  const [currentScores, setCurrentScores] = useState<ReturnType<typeof calculateScores> | null>(null);

  const flipSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    flipSound.current = new Audio("/sounds/flip.mp3");
  }, []);

  useEffect(() => {
    const initial = initBoard();
    setGame(initial);
    setDebugStats(null);
    setScores(null);
    setCurrentScores(calculateScores(initial));

    initMusic();
    setTimeout(() => playMusic(), 300);
    onGameUpdate?.(initial);
  }, [resetKey]);

  const handleClick = (x: number, y: number) => {
    if (!game || gameOver || mode === "ai-vs-ai") return;

    const moves = getLegalMoves(game);
    if (moves.some((p) => p.x === x && p.y === y)) {
      flipSound.current?.play();
      const newGame = makeMove({ x, y }, game);
      setGame(newGame);
      onGameUpdate?.(newGame);
      setCurrentScores(calculateScores(newGame));

      const result = checkGameOver(newGame.board, newGame.emptySlot);
      if (result !== 0) {
        onGameEnd?.(result === 1 ? "red" : "black");
        setScores(computeFinalScores(newGame, "red"));
      }
    }
  };

  useEffect(() => {
    if (!game || gameOver) return;

    const isRedAI = mode === "ai-vs-ai";
    const isBlackAI = mode === "ai-vs-ai" || mode === "vs-ai";
    const isAITurn =
      (game.turn === 1 && isRedAI) || (game.turn === 2 && isBlackAI);

    if (!isAITurn) return;

    const moves = [
      ...getAvailableMoves(game.turn, game.emptySlot, game.board),
      ...getDiagonalMoves(game.turn, game.emptySlot, game.board),
    ];

    if (moves.length === 0) {
      const opponent = game.turn === 1 ? 2 : 1;
      const opponentMoves = [
        ...getAvailableMoves(opponent, game.emptySlot, game.board),
        ...getDiagonalMoves(opponent, game.emptySlot, game.board),
      ];

      if (opponentMoves.length === 0) {
        onGameEnd?.("draw");
      } else {
        onGameEnd?.(game.turn === 1 ? "black" : "red");
        setScores(computeFinalScores(game, "black"));
      }
      return;
    }

    const timeout = setTimeout(() => {
      const depth = game.turn === 1 ? redDepth : blackDepth;
      const { move: bestMove, stats } = runMinimaxWithStats(game, depth, true);
      setDebugStats(stats);
      flipSound.current?.play();
      const newGame = makeMove(bestMove, game);
      setGame(newGame);
      onGameUpdate?.(newGame);
      setCurrentScores(calculateScores(newGame));

      const result = checkGameOver(newGame.board, newGame.emptySlot);
      if (result !== 0) {
        onGameEnd?.(result === 1 ? "red" : "black");
        setScores(computeFinalScores(newGame, "red"));
      }
    }, randomAIDelay());

    return () => clearTimeout(timeout);
  }, [game, gameOver, mode, redDepth, blackDepth]);

  const getCardStyle = (card: Card | null): React.CSSProperties => {
    if (!card) {
      return {
        backgroundColor: "#1a4d1a",
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        borderRadius: "4px",
      };
    }

    let spriteX = 0;
    let spriteY = 0;

    if (card.flipped) {
      spriteX = 0;
      spriteY = 4 * CARD_HEIGHT;
    } else {
      const suits = ["hearts", "diamonds", "clubs", "spades"];
      const suitIndex = suits.indexOf(card.suit);
      const valIndex = card.val === 1 ? 12 : card.val - 2;
      spriteX = valIndex * CARD_WIDTH;
      spriteY = suitIndex * CARD_HEIGHT;
    }

    return {
      backgroundImage: `url(/cards.png)`,
      backgroundPosition: `-${spriteX}px -${spriteY}px`,
      backgroundSize: `${13 * CARD_WIDTH}px ${5 * CARD_HEIGHT}px`,
      backgroundRepeat: "no-repeat",
      width: `${CARD_WIDTH}px`,
      height: `${CARD_HEIGHT}px`,
      borderRadius: "4px",
      backfaceVisibility: "hidden",
    };
  };

  if (!game) return <div className="text-white">Loading board...</div>;

return (
  <div className="flex justify-center w-full mt-8 px-4">
    {/* Full-width horizontal layout */}
    <div className="flex flex-row gap-12 items-start justify-center">
      {/* 🟥 LEFT phantom scroll (invisible but same size) */}
      <div className="w-[700px] hidden lg:block" />

      {/* 🎯 Game Board */}
      <div className="flex flex-col items-center gap-4 mx-auto flex-shrink-0">
        {currentScores && (
          <div className="flex justify-between w-full max-w-[620px] px-2">
            <div className="bg-red-900 text-white px-4 py-2 rounded font-bold text-lg">
              🔴 Red: {currentScores.red}
            </div>
            <div className="bg-black text-white px-4 py-2 rounded font-bold text-lg">
              ⚫ Black: {currentScores.black}
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 border p-2 bg-green-800">
          {game.board.map((row, y) =>
            row.map((card, x) => {
              const isEmpty = !card;
              return (
                <div
                  key={`${x}-${y}`}
                  className="relative bg-green-800"
                  style={{
                    width: `${CARD_WIDTH}px`,
                    height: `${CARD_HEIGHT}px`,
                    perspective: "600px",
                  }}
                >
                  {isEmpty ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: "#1a4d1a",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    <motion.div
                      onClick={() => handleClick(x, y)}
                      className="absolute w-full h-full rounded"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: card.flipped ? 180 : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div
                        className="absolute w-full h-full"
                        style={{
                          ...getCardStyle(card.flipped ? null : card),
                          backfaceVisibility: "hidden",
                        }}
                      />
                      <div
                        className="absolute w-full h-full"
                        style={{
                          ...getCardStyle({
                            val: 0,
                            suit: "spades",
                            isRed: false,
                            flipped: true,
                          }),
                          transform: "rotateY(180deg)",
                          backfaceVisibility: "hidden",
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="text-white text-sm">
          Turn: {game.turn === 1 ? "Red" : "Black"} | Empty: ({game.emptySlot.x},{" "}
          {game.emptySlot.y})
        </div>

        {debugStats && (
          <div className="mt-2 text-gray-300 text-sm bg-zinc-900 px-4 py-2 rounded">
            <div>🔍 AI Debug Info:</div>
            <div>• Lookahead Depth: {debugStats.depth}</div>
            <div>• Nodes Evaluated: {debugStats.nodesEvaluated}</div>
            <div>• Pruned Branches: {debugStats.pruned}</div>
            <div>
              • Best Move: ({debugStats.bestMove.x}, {debugStats.bestMove.y})
            </div>
          </div>
        )}

        {gameOver && scores && (
          <div className="mt-4 bg-black bg-opacity-50 p-4 rounded text-white text-sm">
            <div className="font-bold text-yellow-300">📊 Final Scores</div>
            <div>
              Red: {scores.red} (Numerals: {scores.redBreakdown.numerals}, Courts:{" "}
              {scores.redBreakdown.courts * 10})
            </div>
            <div>
              Black: {scores.black} (Numerals: {scores.blackBreakdown.numerals}, Courts:{" "}
              {scores.blackBreakdown.courts * 10})
            </div>
          </div>
        )}

        <button
          onClick={() => setMusicMuted(toggleMute())}
          className="mt-3 text-sm text-white bg-gray-700 px-3 py-1 rounded"
        >
          {musicMuted ? "Unmute Music" : "Mute Music"}
        </button>
      </div>

      {/* 🟨 RIGHT real scroll */}
      <div className="w-[700px] hidden lg:block -mt-12">
        <img
          src="/gameguide.png"
          alt="Game Guide Scroll"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  </div>
);



}
