import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Flag, ChevronDown, ChevronUp, Grid3x3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onNavigate: (questionNumber: number) => void;
  sections?: {
    name: string;
    startIndex: number;
    endIndex: number;
  }[];
}

export function QuestionNavigation({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  flaggedQuestions,
  onNavigate,
  sections = [],
}: QuestionNavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const answeredCount = answeredQuestions.size;
  const flaggedCount = flaggedQuestions.size;
  const unansweredCount = totalQuestions - answeredCount;
  const progress = (answeredCount / totalQuestions) * 100;

  // If no sections, create a single section with all questions
  const displaySections =
    sections.length > 0
      ? sections
      : [{ name: "Semua Soal", startIndex: 0, endIndex: totalQuestions - 1 }];

  return (
    <>
      {/* Desktop Navigation - Always Visible */}
      <Card className="sticky top-20 hidden lg:block border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="pb-3 border-b-2 border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-black">Navigasi Soal</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-gray-100"
            >
              {collapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-4 pt-4", collapsed && "hidden")}>
          {/* Summary Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-gray-600">Progress</span>
              <span className="font-bold text-black">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-100 [&>div]:bg-black" />

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-white border border-black"></div>
                <span>Dijawab: {answeredCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
                <span>Belum: {unansweredCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-black"></div>
                <span>Saat ini</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flag className="w-3 h-3 text-yellow-600 fill-yellow-400" />
                <span>Ditandai: {flaggedCount}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Question Grid by Section */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {displaySections.map((section, sectionIdx) => {
              const sectionQuestions = Array.from(
                { length: section.endIndex - section.startIndex + 1 },
                (_, i) => section.startIndex + i
              );

              const sectionAnswered = sectionQuestions.filter((q) =>
                answeredQuestions.has(q)
              ).length;

              return (
                <div key={sectionIdx} className="space-y-2">
                  {/* Section Header */}
                  {sections.length > 0 && (
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-black">{section.name}</h4>
                      <Badge variant="outline" className="text-xs border-black text-black font-medium">
                        {sectionAnswered}/{sectionQuestions.length}
                      </Badge>
                    </div>
                  )}

                  {/* Question Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {sectionQuestions.map((questionIndex) => {
                      const isAnswered = answeredQuestions.has(questionIndex);
                      const isFlagged = flaggedQuestions.has(questionIndex);
                      const isCurrent = questionIndex === currentQuestion;

                      return (
                        <button
                          key={questionIndex}
                          type="button"
                          onClick={() => onNavigate(questionIndex)}
                          className={cn(
                            "aspect-square rounded-md font-bold text-sm transition-all relative",
                            "hover:scale-105 hover:shadow-md",
                            "border-2",
                            isCurrent &&
                            "bg-black text-white border-black",
                            isAnswered &&
                            !isCurrent &&
                            "bg-white text-black border-black",
                            !isAnswered &&
                            !isCurrent &&
                            "bg-white text-gray-400 border-gray-200 hover:border-gray-400",
                            isFlagged &&
                            !isCurrent &&
                            "ring-2 ring-yellow-400 ring-offset-1"
                          )}
                          title={`Soal ${questionIndex + 1}${isAnswered ? " (Dijawab)" : ""
                            }${isFlagged ? " (Ditandai)" : ""}`}
                        >
                          {questionIndex + 1}
                          {isFlagged && (
                            <Flag className="w-2.5 h-2.5 absolute -top-1 -right-1 text-yellow-600 fill-yellow-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="bg-gray-200" />

          {/* Legend */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500">
              Keterangan:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-black border-2 border-black flex items-center justify-center text-white font-bold text-[10px]">
                  1
                </div>
                <span>Soal saat ini</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white border-2 border-black flex items-center justify-center text-black font-bold text-[10px]">
                  2
                </div>
                <span>Sudah dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-[10px]">
                  3
                </div>
                <span>Belum dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white border-2 border-gray-200 ring-2 ring-yellow-400 flex items-center justify-center text-gray-400 font-bold text-[10px] relative">
                  4
                  <Flag className="w-2 h-2 absolute -top-0.5 -right-0.5 text-yellow-600 fill-yellow-400" />
                </div>
                <span>Ditandai</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Floating Button */}
      <Button
        onClick={() => setIsMobileDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:hidden bg-black text-white border-2 border-black hover:bg-gray-800"
        size="lg"
      >
        <Grid3x3 className="w-6 h-6" />
      </Button>

      {/* Mobile Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-hidden border-l-2 border-black">
            <Card className="h-full rounded-none border-0 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b-2 border-gray-100">
                <CardTitle className="text-lg font-black">Navigasi Soal</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto pb-20 pt-4">
                {/* Summary Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-600">Progress</span>
                    <span className="font-black text-black">
                      {answeredCount}/{totalQuestions}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3 bg-gray-100 [&>div]:bg-black" />

                  <div className="grid grid-cols-2 gap-3 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-white border border-black"></div>
                      <span>Dijawab: {answeredCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                      <span>Belum: {unansweredCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-black"></div>
                      <span>Saat ini</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-yellow-600 fill-yellow-400" />
                      <span>Ditandai: {flaggedCount}</span>
                    </div>
                  </div>
                </div>

                <Separator className="mb-4 bg-gray-200" />

                {/* Question Grid by Section */}
                <div className="space-y-6">
                  {displaySections.map((section, sectionIdx) => {
                    const sectionQuestions = Array.from(
                      { length: section.endIndex - section.startIndex + 1 },
                      (_, i) => section.startIndex + i
                    );

                    const sectionAnswered = sectionQuestions.filter((q) =>
                      answeredQuestions.has(q)
                    ).length;

                    return (
                      <div key={sectionIdx} className="space-y-3">
                        {/* Section Header */}
                        {sections.length > 0 && (
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-black">
                              {section.name}
                            </h4>
                            <Badge variant="outline" className="text-sm border-black text-black font-medium">
                              {sectionAnswered}/{sectionQuestions.length}
                            </Badge>
                          </div>
                        )}

                        {/* Question Grid - Mobile Optimized */}
                        <div className="grid grid-cols-6 gap-2">
                          {sectionQuestions.map((questionIndex) => {
                            const isAnswered =
                              answeredQuestions.has(questionIndex);
                            const isFlagged =
                              flaggedQuestions.has(questionIndex);
                            const isCurrent = questionIndex === currentQuestion;

                            return (
                              <button
                                key={questionIndex}
                                type="button"
                                onClick={() => {
                                  onNavigate(questionIndex);
                                  setIsMobileDrawerOpen(false);
                                }}
                                className={cn(
                                  "aspect-square rounded-lg font-bold text-sm transition-all relative",
                                  "hover:scale-105 active:scale-95",
                                  "border-2 min-h-[44px] min-w-[44px]", // WCAG touch target
                                  isCurrent &&
                                  "bg-black text-white border-black",
                                  isAnswered &&
                                  !isCurrent &&
                                  "bg-white text-black border-black",
                                  !isAnswered &&
                                  !isCurrent &&
                                  "bg-white text-gray-400 border-gray-200",
                                  isFlagged &&
                                  !isCurrent &&
                                  "ring-2 ring-yellow-400 ring-offset-2"
                                )}
                                title={`Soal ${questionIndex + 1}${isAnswered ? " (Dijawab)" : ""
                                  }${isFlagged ? " (Ditandai)" : ""}`}
                              >
                                {questionIndex + 1}
                                {isFlagged && (
                                  <Flag className="w-3 h-3 absolute -top-1 -right-1 text-yellow-600 fill-yellow-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-6 bg-gray-200" />

                {/* Legend */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-500">
                    Keterangan:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-black border-2 border-black flex items-center justify-center text-white font-bold text-xs">
                        1
                      </div>
                      <span>Soal saat ini</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white border-2 border-black flex items-center justify-center text-black font-bold text-xs">
                        2
                      </div>
                      <span>Sudah dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">
                        3
                      </div>
                      <span>Belum dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white border-2 border-gray-200 ring-2 ring-yellow-400 flex items-center justify-center text-gray-400 font-bold text-xs relative">
                        4
                        <Flag className="w-2 h-2 absolute -top-0.5 -right-0.5 text-yellow-600 fill-yellow-400" />
                      </div>
                      <span>Ditandai</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
