let audio: HTMLAudioElement | null = null;
let isMuted = false;

export const initMusic = () => {
  if (!audio) {
    audio = new Audio("/sounds/medieval.mp3");
    audio.loop = false;
    audio.volume = 0.3;
  }
};

export const playMusic = () => {
  if (!audio || isMuted) return;

  // If music is already playing, don't restart it
  if (!audio.paused && !audio.ended) return;

  audio.currentTime = 0;
  audio.volume = 0.3;

  audio.play().catch(() => {
    /* ignored (autoplay restrictions, etc.) */
  });
};

export const fadeOutMusic = () => {
  if (!audio || audio.paused) return;

  let volume = audio.volume;
  const fadeStep = () => {
    if (volume > 0.05) {
      volume = Math.max(0, volume - 0.02);
      if (audio) audio.volume = volume;
      setTimeout(fadeStep, 50);
    } else {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.3;
      }
    }
  };

  fadeStep();
};

export const stopMusic = () => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.3;
  }
};

export const toggleMute = () => {
  isMuted = !isMuted;
  if (audio) {
    audio.muted = isMuted;
  }
  return isMuted;
};

export const isMusicMuted = () => isMuted;

export const isMusicPlaying = () =>
  !!audio && !audio.paused && !audio.ended;
