import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathContent } from "@/components/MathContent";
import { RichTextDisplay } from "@/components/tryout/RichTextDisplay";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/tryout";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedOption: string | null;
  onSelectOption: (optionKey: string) => void;
  showExplanation?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  selectedOption,
  onSelectOption,
  showExplanation = false,
}: QuestionCardProps) {
  const options = question.question_options || [];

  return (
    <Card className="border-2">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-sm">
            Soal #{questionNumber}
          </Badge>
          {question.subject && (
            <Badge variant="outline" className="text-xs">
              {question.subject}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="space-y-3">
          {question.image_url && (
            <img
              src={question.image_url}
              alt="Question"
              className="max-w-full h-auto rounded-lg border"
            />
          )}
          {/* Use RichTextDisplay if HTML content exists, otherwise fallback to MathContent */}
          {question.question_text_html ? (
            <RichTextDisplay
              content={question.question_text_html}
              className="text-base leading-relaxed"
            />
          ) : (
            <MathContent
              content={question.question_text}
              className="text-base leading-relaxed"
            />
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedOption === option.option_key;
            const isCorrect =
              showExplanation && question.correct_answer === option.option_key;
            const isWrong = showExplanation && isSelected && !isCorrect;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  !showExplanation && onSelectOption(option.option_key)
                }
                disabled={showExplanation}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  "hover:border-primary hover:bg-accent",
                  isSelected && !showExplanation && "border-primary bg-accent",
                  isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                  isWrong && "border-red-500 bg-red-50 dark:bg-red-950",
                  showExplanation && "cursor-default"
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Option Key */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      isSelected &&
                        !showExplanation &&
                        "bg-primary text-primary-foreground",
                      !isSelected && !showExplanation && "bg-muted",
                      isCorrect && "bg-green-500 text-white",
                      isWrong && "bg-red-500 text-white"
                    )}
                  >
                    {option.option_key}
                  </div>

                  {/* Option Content */}
                  <div className="flex-1 min-w-0">
                    {option.option_image_url && (
                      <img
                        src={option.option_image_url}
                        alt={`Option ${option.option_key}`}
                        className="max-w-full h-auto rounded mb-2"
                      />
                    )}
                    {/* Use RichTextDisplay if HTML content exists */}
                    {option.option_text_html ? (
                      <RichTextDisplay
                        content={option.option_text_html}
                        className="text-sm"
                      />
                    ) : (
                      <MathContent
                        content={option.option_text}
                        className="text-sm"
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after submission) */}
        {showExplanation &&
          (question.explanation || question.explanation_html) && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Pembahasan:
              </h4>
              {/* Use RichTextDisplay if HTML content exists */}
              {question.explanation_html ? (
                <RichTextDisplay
                  content={question.explanation_html}
                  className="text-sm text-blue-800 dark:text-blue-200"
                />
              ) : (
                <MathContent
                  content={question.explanation || ""}
                  className="text-sm text-blue-800 dark:text-blue-200"
                />
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
