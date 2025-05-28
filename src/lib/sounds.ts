// lib/sounds.ts
const flipSound = new Audio("/sounds/flip.mp3");

export const playFlipSound = () => {
  flipSound.currentTime = 0;
  flipSound.play();
};
