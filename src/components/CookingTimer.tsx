"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer, Volume2 } from "lucide-react";

interface CookingTimerProps {
  initialMinutes?: number;
  onClose?: () => void;
}

export default function CookingTimer({ initialMinutes = 5 }: CookingTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio chime generator
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio not permitted or supported, graceful fallback
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playAlertSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const setTimerPreset = (mins: number) => {
    setIsRunning(false);
    setTotalSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
  };

  const toggleRun = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
    }
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
            Pengatur Waktu Masak
          </span>
        </div>
        <button
          type="button"
          onClick={playAlertSound}
          title="Uji bunyi notifikasi"
          className="text-gray-700 hover:text-emerald-600 dark:text-gray-200 p-1"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {[1, 3, 5, 10, 15, 20].map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => setTimerPreset(mins)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              totalSeconds === mins * 60 && !isRunning
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-800/60"
            }`}
          >
            {mins} mnt
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="text-center py-2">
        <div
          className={`text-4xl sm:text-5xl font-mono font-bold tracking-tight transition-colors ${
            remainingSeconds === 0
              ? "text-red-500 animate-bounce"
              : isRunning
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-emerald-950 dark:text-emerald-50"
          }`}
        >
          {formatTime(remainingSeconds)}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-emerald-200/50 dark:bg-emerald-900/60 overflow-hidden mt-3">
          <div
            className="h-full bg-emerald-600 transition-all duration-500 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={toggleRun}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-md active:scale-95 transition-all ${
            isRunning
              ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Jeda
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Mulai
            </>
          )}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="p-2 text-gray-700 hover:text-emerald-700 dark:text-gray-200 dark:hover:text-emerald-300 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
