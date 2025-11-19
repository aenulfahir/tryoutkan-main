import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  ChevronLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit,
} from "lucide-react";
import type { ExtractedQuestion } from "@/services/aiQuestionExtractor";

interface QuestionImportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: ExtractedQuestion[];
  tryoutPackageId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function QuestionImportPreview({
  open,
  onOpenChange,
  questions: initialQuestions,
  tryoutPackageId,
  onSuccess,
  onBack,
}: QuestionImportPreviewProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set(initialQuestions.map((_, index) => index))
  );
  const [importing, setImporting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleToggleQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((_, index) => index)));
    }
  };

  const handleEditQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleEditOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleImport = async () => {
    const selectedQuestionsArray = questions.filter((_, index) =>
      selectedQuestions.has(index)
    );

    if (selectedQuestionsArray.length === 0) {
      toast.error("Pilih minimal 1 soal untuk diimport");
      return;
    }

    try {
      setImporting(true);

      // Get current max question number
      const { data: existingQuestions } = await supabase
        .from("questions")
        .select("question_number")
        .eq("tryout_package_id", tryoutPackageId)
        .order("question_number", { ascending: false })
        .limit(1);

      let startNumber =
        existingQuestions && existingQuestions.length > 0
          ? existingQuestions[0].question_number + 1
          : 1;

      // Import each question
      for (const question of selectedQuestionsArray) {
        // Strip HTML tags for plain text fields
        const stripHtml = (html: string) => {
          if (!html) return "";
          const tmp = document.createElement("div");
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || "";
        };

        // Insert question
        const { data: insertedQuestion, error: questionError } = await supabase
          .from("questions")
          .insert({
            tryout_package_id: tryoutPackageId,
            question_number: startNumber,
            question_text: stripHtml(question.question_text), // Plain text
            question_text_html: question.question_text, // Rich text HTML
            question_type: "multiple_choice", // Default type
            subject: question.question_type, // TWK/TIU/TKP goes to subject field
            difficulty: "medium",
            points: 5,
            correct_answer: question.correct_answer,
            explanation: stripHtml(question.explanation), // Plain text
            explanation_html: question.explanation, // Rich text HTML
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Insert options
        for (const option of question.options) {
          const { error: optionError } = await supabase
            .from("question_options")
            .insert({
              question_id: insertedQuestion.id,
              option_key: option.key,
              option_text: stripHtml(option.text), // Plain text
              option_text_html: option.text, // Rich text HTML
            });

          if (optionError) throw optionError;
        }

        startNumber++;
      }

      toast.success(`Berhasil import ${selectedQuestionsArray.length} soal!`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error importing questions:", error);
      toast.error("Gagal import soal", {
        description: error.message,
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="font-black text-xl">
            Preview & Edit Soal ({selectedQuestions.size}/{questions.length}{" "}
            dipilih)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2 p-4 bg-gray-100 border-2 border-black rounded-lg">
            <Checkbox
              checked={selectedQuestions.size === questions.length}
              onCheckedChange={handleToggleAll}
              className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
            />
            <Label className="cursor-pointer font-bold">Pilih Semua Soal</Label>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${selectedQuestions.has(index)
                    ? "border-black bg-white"
                    : "border-gray-300 bg-gray-50 opacity-70"
                  }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedQuestions.has(index)}
                      onCheckedChange={() => handleToggleQuestion(index)}
                      className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-2 border-black font-bold">
                          Soal #{question.question_number}
                        </Badge>
                        <Badge className="bg-black text-white border-2 border-black font-bold">{question.question_type}</Badge>
                        <Badge
                          variant={
                            question.confidence > 0.8
                              ? "default"
                              : question.confidence > 0.6
                                ? "secondary"
                                : "destructive"
                          }
                          className={`border-2 font-bold ${question.confidence > 0.8
                              ? "bg-green-100 text-green-800 border-green-800"
                              : question.confidence > 0.6
                                ? "bg-yellow-100 text-yellow-800 border-yellow-800"
                                : "bg-red-100 text-red-800 border-red-800"
                            }`}
                        >
                          {question.confidence > 0.8 ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {(question.confidence * 100).toFixed(0)}% yakin
                        </Badge>
                      </div>

                      {editingIndex === index ? (
                        <div className="space-y-3">
                          <Textarea
                            value={question.question_text}
                            onChange={(e) =>
                              handleEditQuestion(
                                index,
                                "question_text",
                                e.target.value
                              )
                            }
                            rows={3}
                            className="border-2 border-black font-medium focus-visible:ring-0"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="font-bold">Jenis Soal</Label>
                              <Select
                                value={question.question_type}
                                onValueChange={(value) =>
                                  handleEditQuestion(
                                    index,
                                    "question_type",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="border-2 border-black font-bold focus:ring-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-black font-medium">
                                  <SelectItem value="TWK">TWK</SelectItem>
                                  <SelectItem value="TIU">TIU</SelectItem>
                                  <SelectItem value="TKP">TKP</SelectItem>
                                  <SelectItem value="multiple_choice">
                                    Multiple Choice
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="font-bold">Jawaban Benar</Label>
                              <Select
                                value={question.correct_answer}
                                onValueChange={(value) =>
                                  handleEditQuestion(
                                    index,
                                    "correct_answer",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="border-2 border-black font-bold focus:ring-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-black font-medium">
                                  {question.options.map((opt) => (
                                    <SelectItem key={opt.key} value={opt.key}>
                                      {opt.key}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-800">{question.question_text}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingIndex(editingIndex === index ? null : index)
                      }
                      className="hover:bg-gray-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 pl-9">
                  {question.options.map((option, optIndex) => (
                    <div key={option.key} className="flex items-start gap-2">
                      <span className="font-black text-sm min-w-[20px]">
                        {option.key}.
                      </span>
                      {editingIndex === index ? (
                        <Input
                          value={option.text}
                          onChange={(e) =>
                            handleEditOption(index, optIndex, e.target.value)
                          }
                          className="flex-1 border-2 border-black font-medium focus-visible:ring-0"
                        />
                      ) : (
                        <span
                          className={`text-sm flex-1 font-medium ${option.key === question.correct_answer
                              ? "font-bold text-green-700"
                              : "text-gray-600"
                            }`}
                        >
                          {option.text}
                          {option.key === question.correct_answer && (
                            <CheckCircle2 className="w-4 h-4 inline ml-2 text-green-600" />
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="pl-9 pt-2 border-t-2 border-gray-200">
                    <Label className="text-xs font-bold text-gray-500">
                      Pembahasan:
                    </Label>
                    {editingIndex === index ? (
                      <Textarea
                        value={question.explanation}
                        onChange={(e) =>
                          handleEditQuestion(
                            index,
                            "explanation",
                            e.target.value
                          )
                        }
                        rows={2}
                        className="mt-1 border-2 border-black font-medium focus-visible:ring-0"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-600 mt-1">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onBack}
            disabled={importing}
            className="border-2 border-black font-bold hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing}
            className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengimport...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Import {selectedQuestions.size} Soal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
