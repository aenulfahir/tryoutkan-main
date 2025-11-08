import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import type {
  PracticeSessionWithQuestions,
  PracticeAnswer,
  PracticeQuestion,
} from "@/types/practice";
import {
  getPracticeSessionWithQuestions,
  updatePracticeSession,
  savePracticeAnswer,
  getPracticeAnswers,
  formatTime,
} from "@/services/practice";

// Types
interface PracticeState {
  session: PracticeSessionWithQuestions | null;
  currentQuestionIndex: number;
  selectedAnswer: string;
  timeRemaining: number;
  isPaused: boolean;
  answers: Map<string, PracticeAnswer>;
  questionStartTime: number;
  loading: boolean;
  startingSession: boolean;
  error: string | null;
}

type PracticeAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SESSION"; payload: PracticeSessionWithQuestions }
  | { type: "SET_CURRENT_QUESTION_INDEX"; payload: number }
  | { type: "SET_SELECTED_ANSWER"; payload: string }
  | { type: "SET_TIME_REMAINING"; payload: number }
  | { type: "SET_IS_PAUSED"; payload: boolean }
  | { type: "SET_ANSWERS"; payload: Map<string, PracticeAnswer> }
  | {
      type: "ADD_ANSWER";
      payload: { questionId: string; answer: PracticeAnswer };
    }
  | { type: "SET_QUESTION_START_TIME"; payload: number }
  | { type: "SET_STARTING_SESSION"; payload: boolean }
  | { type: "RESET_SESSION" };

// Initial state
const initialState: PracticeState = {
  session: null,
  currentQuestionIndex: 0,
  selectedAnswer: "",
  timeRemaining: 30,
  isPaused: false,
  answers: new Map(),
  questionStartTime: Date.now(),
  loading: true,
  startingSession: false,
  error: null,
};

// Reducer
function practiceReducer(
  state: PracticeState,
  action: PracticeAction
): PracticeState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_SESSION":
      return {
        ...state,
        session: action.payload,
        loading: false,
        error: null,
      };
    case "SET_CURRENT_QUESTION_INDEX":
      return { ...state, currentQuestionIndex: action.payload };
    case "SET_SELECTED_ANSWER":
      return { ...state, selectedAnswer: action.payload };
    case "SET_TIME_REMAINING":
      return { ...state, timeRemaining: action.payload };
    case "SET_IS_PAUSED":
      return { ...state, isPaused: action.payload };
    case "SET_ANSWERS":
      return { ...state, answers: action.payload };
    case "ADD_ANSWER":
      const newAnswers = new Map(state.answers);
      newAnswers.set(action.payload.questionId, action.payload.answer);
      return { ...state, answers: newAnswers };
    case "SET_QUESTION_START_TIME":
      return { ...state, questionStartTime: action.payload };
    case "SET_STARTING_SESSION":
      return { ...state, startingSession: action.payload };
    case "RESET_SESSION":
      return {
        ...initialState,
        loading: false,
      };
    default:
      return state;
  }
}

// Context
interface PracticeContextType {
  state: PracticeState;
  dispatch: React.Dispatch<PracticeAction>;
  actions: {
    loadSession: (sessionId: string) => Promise<void>;
    startSession: () => Promise<void>;
    handleAnswerSelect: (answer: string) => Promise<void>;
    moveToNextQuestion: () => Promise<void>;
    pauseSession: () => void;
    resumeSession: () => void;
    resetSession: () => void;
    getCurrentQuestion: () => PracticeQuestion | null;
    getProgress: () => number;
    isLastQuestion: () => boolean;
  };
}

const PracticeContext = createContext<PracticeContextType | undefined>(
  undefined
);

// Provider
interface PracticeProviderProps {
  children: ReactNode;
  sessionId: string;
}

export function PracticeProvider({
  children,
  sessionId,
}: PracticeProviderProps) {
  const [state, dispatch] = useReducer(practiceReducer, initialState);

  // Normalize answers for comparison (e.g., 'b', 'B.', ' b ' => 'B')
  const normalizeAnswer = (s?: string | null) =>
    (s ?? "").toString().trim().replace(/\./g, "").toUpperCase();

  // Actions
  const actions = {
    loadSession: async (sessionId: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const { data, error } = await getPracticeSessionWithQuestions(
          sessionId
        );

        if (error || !data) {
          dispatch({ type: "SET_ERROR", payload: "Gagal memuat sesi latihan" });
          toast.error("Gagal memuat sesi latihan");
          return;
        }

        // Check if questions have options and create missing ones if needed
        const questionsWithoutOptions = data.questions.filter(
          (q) =>
            !q.practice_question_options ||
            q.practice_question_options.length === 0
        );

        if (questionsWithoutOptions.length > 0) {
          // Create generic options for questions without them
          for (const question of questionsWithoutOptions) {
            // Create basic A, B, C, D options for this question
            const genericOptions = [
              { option_key: "A", option_text: "Pilihan A" },
              { option_key: "B", option_text: "Pilihan B" },
              { option_key: "C", option_text: "Pilihan C" },
              { option_key: "D", option_text: "Pilihan D" },
            ];

            // This would need a service call to actually create options
            // For now, we'll continue with the session
          }
        }

        // Update session state
        dispatch({ type: "SET_SESSION", payload: data });
        dispatch({
          type: "SET_CURRENT_QUESTION_INDEX",
          payload: data.current_question_index,
        });

        // Load existing answers
        const { data: existingAnswers } = await getPracticeAnswers(sessionId);
        const answersMap = new Map<string, PracticeAnswer>();
        existingAnswers?.forEach((answer) => {
          answersMap.set(answer.question_id, answer);
        });
        dispatch({ type: "SET_ANSWERS", payload: answersMap });

        // Set timer based on current question
        const currentQ = data.questions[data.current_question_index];
        if (currentQ) {
          const timeLimit =
            currentQ.time_limit_seconds ||
            currentQ.time_limit ||
            data.practice_packages?.default_time_per_question ||
            30;
          dispatch({ type: "SET_TIME_REMAINING", payload: timeLimit });
          dispatch({ type: "SET_QUESTION_START_TIME", payload: Date.now() });
        }
      } catch (error) {
        console.error("Error loading practice session:", error);
        dispatch({
          type: "SET_ERROR",
          payload: "Terjadi kesalahan saat memuat sesi",
        });
        toast.error("Terjadi kesalahan saat memuat sesi");
      }
    },

    startSession: async () => {
      if (!state.session) return;

      try {
        dispatch({ type: "SET_STARTING_SESSION", payload: true });

        const { error } = await updatePracticeSession(sessionId, {
          status: "in_progress",
          started_at: new Date().toISOString(),
          current_question_index: 0,
        });

        if (error) {
          console.error("Error starting session:", error);
          toast.error("Gagal memulai sesi");
          return;
        }

        dispatch({ type: "SET_QUESTION_START_TIME", payload: Date.now() });

        // Update session in state
        const updatedSession = {
          ...state.session,
          status: "in_progress" as const,
        };
        dispatch({ type: "SET_SESSION", payload: updatedSession });

        toast.success("Sesi dimulai!");
      } catch (error) {
        console.error("Error starting session:", error);
        toast.error("Terjadi kesalahan saat memulai sesi");
      } finally {
        dispatch({ type: "SET_STARTING_SESSION", payload: false });
      }
    },

    handleAnswerSelect: async (answer: string) => {
      const currentQuestion = actions.getCurrentQuestion();
      if (!currentQuestion || !state.session) return;

      dispatch({ type: "SET_SELECTED_ANSWER", payload: answer });
      dispatch({ type: "SET_IS_PAUSED", payload: true });

      // Calculate time spent on this question
      const timeSpent = Math.round(
        (Date.now() - state.questionStartTime) / 1000
      );

      // Check if answer is correct immediately (normalized)
      const isCorrect =
        normalizeAnswer(answer) ===
        normalizeAnswer(currentQuestion.correct_answer);

      try {
        await savePracticeAnswer(
          sessionId,
          currentQuestion.id,
          answer,
          timeSpent,
          isCorrect // Set is_correct immediately
        );

        const newAnswer: PracticeAnswer = {
          id: "",
          user_practice_session_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer: answer,
          is_correct: isCorrect,
          time_spent_seconds: timeSpent,
          answered_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        dispatch({
          type: "ADD_ANSWER",
          payload: { questionId: currentQuestion.id, answer: newAnswer },
        });

        // Auto move to next question after short delay
        setTimeout(() => {
          actions.moveToNextQuestion();
        }, 500);
      } catch (error) {
        console.error("Error saving answer:", error);
        toast.error("Gagal menyimpan jawaban");
      }
    },

    moveToNextQuestion: async () => {
      if (!state.session) return;

      if (actions.isLastQuestion()) {
        await actions.completeSession();
      } else {
        const nextIndex = state.currentQuestionIndex + 1;
        dispatch({ type: "SET_CURRENT_QUESTION_INDEX", payload: nextIndex });

        // Update session progress
        await updatePracticeSession(sessionId, {
          current_question_index: nextIndex,
        });

        // Reset for next question
        const nextQuestion = state.session.questions[nextIndex];
        if (nextQuestion) {
          const timeLimit =
            nextQuestion.time_limit_seconds ||
            nextQuestion.time_limit ||
            state.session.practice_packages?.default_time_per_question ||
            30;
          dispatch({ type: "SET_TIME_REMAINING", payload: timeLimit });
          dispatch({ type: "SET_QUESTION_START_TIME", payload: Date.now() });
          dispatch({ type: "SET_SELECTED_ANSWER", payload: "" });
          dispatch({ type: "SET_IS_PAUSED", payload: false });
        }
      }
    },

    pauseSession: () => {
      dispatch({ type: "SET_IS_PAUSED", payload: true });
    },

    resumeSession: () => {
      dispatch({ type: "SET_IS_PAUSED", payload: false });
    },

    resetSession: () => {
      dispatch({ type: "RESET_SESSION" });
    },

    getCurrentQuestion: () => {
      if (
        !state.session ||
        !state.session.questions[state.currentQuestionIndex]
      ) {
        return null;
      }
      return state.session.questions[state.currentQuestionIndex];
    },

    getProgress: () => {
      if (!state.session) return 0;
      return (
        ((state.currentQuestionIndex + 1) / state.session.questions.length) *
        100
      );
    },

    isLastQuestion: () => {
      if (!state.session) return false;
      return state.currentQuestionIndex === state.session.questions.length - 1;
    },

    completeSession: async () => {
      if (!state.session) return;

      try {
        // Build a fresh copy to avoid stale-closure issues and ensure
        // the last selected answer is included even if state closure is stale.
        const latestAnswers = new Map(state.answers);

        const currentQ = state.session.questions[state.currentQuestionIndex];

        // If user just selected an answer on the last question, it might not yet
        // exist inside state.answers due to async dispatch timing.
        if (
          state.selectedAnswer &&
          currentQ &&
          !latestAnswers.has(currentQ.id)
        ) {
          const currentQuestionTime = Math.round(
            (Date.now() - state.questionStartTime) / 1000
          );
          const isCorrectBuffered =
            normalizeAnswer(state.selectedAnswer) ===
            normalizeAnswer(currentQ.correct_answer);

          const bufferedAnswer: PracticeAnswer = {
            id: "",
            user_practice_session_id: sessionId,
            question_id: currentQ.id,
            selected_answer: state.selectedAnswer,
            is_correct: isCorrectBuffered,
            time_spent_seconds: currentQuestionTime,
            answered_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };

          latestAnswers.set(currentQ.id, bufferedAnswer);
        }

        // Aggregate stats
        let totalTimeSpent = 0;
        let correctCount = 0;

        latestAnswers.forEach((answer) => {
          totalTimeSpent += answer.time_spent_seconds || 0;
          if (answer.is_correct) correctCount++;
        });

        const answeredCount = latestAnswers.size;

        // Persist session summary
        const { error } = await updatePracticeSession(sessionId, {
          status: "completed",
          completed_at: new Date().toISOString(),
          total_time_spent_seconds: totalTimeSpent,
          total_answered: answeredCount,
          correct_answers: correctCount,
        });

        if (error) {
          console.error("Error completing session:", error);
          toast.error("Gagal menyelesaikan sesi");
        } else {
          // Reflect latest answers and computed stats in local state to drive UI
          dispatch({ type: "SET_ANSWERS", payload: latestAnswers });

          const updatedSession = {
            ...state.session,
            status: "completed" as const,
            total_time_spent_seconds: totalTimeSpent,
            total_answered: answeredCount,
            correct_answers: correctCount,
          };
          dispatch({ type: "SET_SESSION", payload: updatedSession });
          toast.success("Sesi selesai!");
        }
      } catch (error) {
        console.error("Error completing session:", error);
        toast.error("Terjadi kesalahan saat menyelesaikan sesi");
      }
    },
  };

  // Load session on mount
  useEffect(() => {
    if (sessionId) {
      actions.loadSession(sessionId);
    }
  }, [sessionId]);

  const value = {
    state,
    dispatch,
    actions,
  };

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
}

// Hook
export function usePractice() {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
}
