import { useEffect, useState, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
  initialElapsed?: number; // Initial elapsed time in seconds
  sessionId?: string; // Session ID for storing timer state
}

export function Timer({
  durationMinutes,
  onTimeUp,
  isPaused = false,
  initialElapsed = 0,
  sessionId,
}: TimerProps) {
  const totalTime = durationMinutes * 60; // Total time in seconds
  const initialTimeRemaining = Math.max(0, totalTime - initialElapsed);
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining); // in seconds
  const startTimeRef = useRef<number | null>(null);
  const storageKey = sessionId ? `timer_${sessionId}` : null;

  // Load timer state from sessionStorage on mount
  useEffect(() => {
    if (storageKey) {
      try {
        const storedState = sessionStorage.getItem(storageKey);
        if (storedState) {
          const {
            timeRemaining: storedTimeRemaining,
            startTime: storedStartTime,
          } = JSON.parse(storedState);

          // Calculate elapsed time since last save
          if (storedStartTime) {
            const elapsedSinceLastSave = Math.floor(
              (Date.now() - storedStartTime) / 1000
            );
            const newTimeRemaining = Math.max(
              0,
              storedTimeRemaining - elapsedSinceLastSave
            );

            setTimeRemaining(newTimeRemaining);

            // If time has run out while page was closed
            if (newTimeRemaining <= 0) {
              onTimeUp();
            }
          } else {
            setTimeRemaining(storedTimeRemaining);
          }
        }
      } catch (error) {
        console.error("Error loading timer state:", error);
      }
    }
  }, [storageKey, onTimeUp]);

  // Save timer state to sessionStorage periodically
  useEffect(() => {
    if (storageKey) {
      const saveState = () => {
        try {
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({
              timeRemaining,
              startTime: Date.now(),
            })
          );
        } catch (error) {
          console.error("Error saving timer state:", error);
        }
      };

      // Save immediately when timeRemaining changes
      saveState();

      // Also save periodically as a backup
      const interval = setInterval(saveState, 5000);
      return () => clearInterval(interval);
    }
  }, [timeRemaining, storageKey]);

  // Clear timer state when component unmounts or timer completes
  useEffect(() => {
    return () => {
      if (storageKey && timeRemaining <= 0) {
        try {
          sessionStorage.removeItem(storageKey);
        } catch (error) {
          console.error("Error clearing timer state:", error);
        }
      }
    };
  }, [storageKey, timeRemaining]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();

          // Clear timer state when time is up
          if (storageKey) {
            try {
              sessionStorage.removeItem(storageKey);
            } catch (error) {
              console.error("Error clearing timer state:", error);
            }
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onTimeUp, storageKey]);

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
          ? "bg-red-50 border-black animate-pulse"
          : isWarning
            ? "bg-yellow-50 border-black"
            : "bg-white border-black"
      )}
    >
      {isCritical ? (
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 animate-pulse flex-shrink-0" />
      ) : (
        <Clock
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0",
            isWarning
              ? "text-yellow-600"
              : "text-black"
          )}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
        <p className="text-xs text-gray-600 hidden sm:block font-medium">
          Waktu Tersisa
        </p>
        <p
          className={cn(
            "text-lg sm:text-xl font-black tabular-nums",
            isCritical
              ? "text-red-600"
              : isWarning
                ? "text-yellow-600"
                : "text-black"
          )}
        >
          {formatTime(timeRemaining)}
        </p>
      </div>
    </div>
  );
}
