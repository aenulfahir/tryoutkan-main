import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function Timer({ durationMinutes, onTimeUp, isPaused = false }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60); // in seconds

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
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = (timeRemaining / (durationMinutes * 60)) * 100;
  const isWarning = percentage <= 20;
  const isCritical = percentage <= 10;

  return (
    <div
      className={cn(
        'flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-colors',
        isCritical
          ? 'bg-red-50 border-red-500 dark:bg-red-950'
          : isWarning
          ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950'
          : 'bg-card border-border'
      )}
    >
      {isCritical ? (
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
      ) : (
        <Clock className={cn('w-5 h-5', isWarning ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground')} />
      )}
      <div>
        <p className="text-xs text-muted-foreground">Waktu Tersisa</p>
        <p
          className={cn(
            'text-xl font-bold tabular-nums',
            isCritical
              ? 'text-red-600 dark:text-red-400'
              : isWarning
              ? 'text-yellow-600 dark:text-yellow-400'
              : ''
          )}
        >
          {formatTime(timeRemaining)}
        </p>
      </div>
    </div>
  );
}

