import { useEffect, useCallback, useState } from "react";

interface SwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function useSwipeNavigation(options: SwipeNavigationOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefault = true,
  } = options;

  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const minSwipeDistance = threshold;

  // Reset touch points
  const resetTouch = useCallback(() => {
    setTouchStart(null);
    setIsSwiping(false);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const point = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setTouchStart(point);
    setIsSwiping(true);
    setTouchStartTime(Date.now());

    // Don't prevent default on touch start to allow normal scrolling
    // We'll prevent default only when we detect a horizontal swipe
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStart || !isSwiping) return;

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStart.x);
      const deltaY = Math.abs(touch.clientY - touchStart.y);

      // Only prevent default if we're doing a horizontal swipe
      // This allows normal vertical scrolling
      if (deltaX > deltaY && deltaX > 20) {
        e.preventDefault();
      }
    },
    [touchStart, isSwiping]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStartTime;

      // Check if swipe is valid (fast enough and long enough)
      const isSwipeValid =
        Math.abs(deltaX) > minSwipeDistance ||
        Math.abs(deltaY) > minSwipeDistance;

      if (!isSwipeValid || deltaTime > 500) {
        resetTouch();
        return;
      }

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe - don't handle vertical swipes for question navigation
        // This allows normal scrolling
      }

      resetTouch();
    },
    [touchStart, minSwipeDistance, onSwipeLeft, onSwipeRight, touchStartTime]
  );

  // Add event listeners
  useEffect(() => {
    const element = document.body; // Listen on body instead of document

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", resetTouch, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", resetTouch);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, resetTouch]);

  return {
    touchStart,
    isSwiping,
    resetTouch,
  };
}

// Hook for keyboard navigation (desktop fallback)
export function useKeyboardNavigation(
  onPrevious: () => void,
  onNext: () => void,
  onFlag: () => void,
  onSubmit: () => void,
  onNavigate: (index: number) => void,
  totalQuestions: number
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for our custom shortcuts
      if (event.ctrlKey || event.metaKey || event.altKey) {
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            if (onPrevious) onPrevious();
            break;
          case "ArrowRight":
            event.preventDefault();
            if (onNext) onNext();
            break;
          case "Enter":
            event.preventDefault();
            if (onSubmit) onSubmit();
            break;
        }
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          if (onPrevious) onPrevious();
          break;
        case "ArrowRight":
          if (onNext) onNext();
          break;
        case "ArrowUp":
          event.preventDefault(); // Prevent page scroll
          break;
        case "ArrowDown":
          event.preventDefault(); // Prevent page scroll
          break;
        case "f":
        case "F":
          event.preventDefault();
          if (onFlag) onFlag();
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          event.preventDefault();
          // Option selection would be handled by the question component
          break;
        case "6":
        case "7":
        case "8":
        case "9":
          event.preventDefault();
          // Number navigation (6-9 for questions 6-9)
          const questionIndex = parseInt(event.key) - 1;
          if (
            questionIndex >= 0 &&
            questionIndex < totalQuestions &&
            questionIndex < 10
          ) {
            if (onNavigate) onNavigate(questionIndex);
          }
          break;
        case "0":
          event.preventDefault();
          // Number navigation (0 for question 10)
          if (totalQuestions >= 10) {
            if (onNavigate) onNavigate(9);
          }
          break;
        case "Escape":
          // Close modals or return to question overview
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onPrevious, onNext, onFlag, onSubmit, onNavigate, totalQuestions]);
}

// Hook for quick jump navigation
export function useQuickJumpNavigation(
  totalQuestions: number,
  onNavigate: (index: number) => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle number keys when not in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Handle number keys for quick navigation (1-9 for questions 1-9)
      if (event.key >= "1" && event.key <= "9") {
        const questionIndex = parseInt(event.key) - 1;
        if (
          questionIndex >= 0 &&
          questionIndex < totalQuestions &&
          questionIndex < 9
        ) {
          event.preventDefault();
          onNavigate(questionIndex);
        }
      }

      // Handle 0 key for question 10
      if (event.key === "0" && totalQuestions >= 10) {
        event.preventDefault();
        onNavigate(9);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [totalQuestions, onNavigate]);
}