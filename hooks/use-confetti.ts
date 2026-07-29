"use client";

import confetti from "canvas-confetti";
import { useCallback } from "react";

type ConfettiOptions = Parameters<typeof confetti>[0];

export function useConfetti() {
  const triggerConfetti = useCallback(() => {
    const count = 200;
    const defaults: ConfettiOptions = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio: number, options: ConfettiOptions) {
      void confetti({
        ...defaults,
        ...options,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  return triggerConfetti;
}
