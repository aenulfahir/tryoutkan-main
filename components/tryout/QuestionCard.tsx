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
    <Card className="border-2 border-black w-full max-w-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="space-y-3 pb-4 sm:pb-6 border-b-2 border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Badge variant="secondary" className="text-sm w-fit bg-black text-white hover:bg-gray-800 border-2 border-black font-bold">
            Soal #{questionNumber}
          </Badge>
          {question.subject && (
            <Badge variant="outline" className="text-xs w-fit border-2 border-black text-black font-bold">
              {question.subject}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pt-6">
        {/* Question Text */}
        <div className="space-y-3">
          {question.image_url && (
            <img
              src={question.image_url}
              alt="Question"
              className="max-w-full h-auto rounded-lg border-2 border-black sm:max-w-md mx-auto block"
            />
          )}
          {/* Use RichTextDisplay if HTML content exists, otherwise fallback to MathContent */}
          {question.question_text_html ? (
            <RichTextDisplay
              content={question.question_text_html}
              className="text-sm sm:text-base leading-relaxed font-medium text-black"
            />
          ) : (
            <MathContent
              content={question.question_text}
              className="text-sm sm:text-base leading-relaxed font-medium text-black"
            />
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 sm:space-y-4">
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
                  "w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all",
                  "hover:border-black hover:bg-gray-50 active:scale-[0.98]",
                  "min-h-[44px] sm:min-h-[48px]", // WCAG touch target minimum
                  isSelected && !showExplanation && "border-black bg-black text-white hover:bg-black hover:text-white",
                  isCorrect && "border-green-600 bg-green-50",
                  isWrong && "border-red-600 bg-red-50",
                  showExplanation && "cursor-default"
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Option Key */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm border-2",
                      isSelected &&
                      !showExplanation &&
                      "bg-white text-black border-white",
                      !isSelected && !showExplanation && "bg-gray-100 border-black text-black",
                      isCorrect && "bg-green-600 text-white border-green-600",
                      isWrong && "bg-red-600 text-white border-red-600"
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
                        className="max-w-full h-auto rounded mb-2 sm:max-w-xs border border-gray-200"
                      />
                    )}
                    {/* Use RichTextDisplay if HTML content exists */}
                    {option.option_text_html ? (
                      <RichTextDisplay
                        content={option.option_text_html}
                        className={cn(
                          "text-xs sm:text-sm font-medium",
                          isSelected && !showExplanation ? "text-white" : "text-black"
                        )}
                      />
                    ) : (
                      <MathContent
                        content={option.option_text}
                        className={cn(
                          "text-xs sm:text-sm font-medium",
                          isSelected && !showExplanation ? "text-white" : "text-black"
                        )}
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
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gray-50 rounded-xl border-2 border-black border-dashed">
              <h4 className="font-black text-black mb-2 text-sm sm:text-base flex items-center gap-2">
                <span>💡</span> Pembahasan:
              </h4>
              {/* Use RichTextDisplay if HTML content exists */}
              {question.explanation_html ? (
                <RichTextDisplay
                  content={question.explanation_html}
                  className="text-xs sm:text-sm text-gray-700 font-medium"
                />
              ) : (
                <MathContent
                  content={question.explanation || ""}
                  className="text-xs sm:text-sm text-gray-700 font-medium"
                />
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
