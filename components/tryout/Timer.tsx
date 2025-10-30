import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
  initialElapsed?: number; // Initial elapsed time in seconds
}

export function Timer({
  durationMinutes,
  onTimeUp,
  isPaused = false,
  initialElapsed = 0,
}: TimerProps) {
  const totalTime = durationMinutes * 60; // Total time in seconds
  const initialTimeRemaining = Math.max(0, totalTime - initialElapsed);
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining); // in seconds

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const percentage = (timeRemaining / totalTime) * 100;
  const isWarning = percentage <= 20;
  const isCritical = percentage <= 10;

  return (
    <div
      className={cn(
        "flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all",
        "min-h-[44px] sm:min-h-[48px]", // WCAG touch target minimum
        isCritical
          ? "bg-red-50 border-red-500 dark:bg-red-950 animate-pulse"
          : isWarning
          ? "bg-yellow-50 border-yellow-500 dark:bg-yellow-950"
          : "bg-card border-border"
      )}
    >
      {isCritical ? (
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 animate-pulse flex-shrink-0" />
      ) : (
        <Clock
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0",
            isWarning
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-muted-foreground"
          )}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground hidden sm:block">
          Waktu Tersisa
        </p>
        <p
          className={cn(
            "text-lg sm:text-xl font-bold tabular-nums",
            isCritical
              ? "text-red-600 dark:text-red-400"
              : isWarning
              ? "text-yellow-600 dark:text-yellow-400"
              : ""
          )}
        >
          {formatTime(timeRemaining)}
        </p>
      </div>
    </div>
  );
}
