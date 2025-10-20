import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { AIGenerateButton } from "@/components/admin/AIGenerateButton";
import { PDFQuestionImport } from "@/components/admin/PDFQuestionImport";
import type { GeneratedQuestion } from "@/services/aiQuestionGenerator";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Eye,
  Save,
  GripVertical,
  FileUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuestionData {
  question_number: number;
  question_text: string;
  subject: string;
  difficulty: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
  points: number;
  time_limit?: number;
}

interface QuestionFormStepProps {
  questions: QuestionData[];
  config: any;
  onQuestionChange: (
    index: number,
    field: keyof QuestionData,
    value: any
  ) => void;
  onOptionChange: (
    questionIndex: number,
    optionIndex: number,
    text: string
  ) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onDuplicateQuestion: (index: number) => void;
  onPrevious: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export function QuestionFormStep({
  questions,
  config,
  onQuestionChange,
  onOptionChange,
  onAddQuestion,
  onRemoveQuestion,
  onDuplicateQuestion,
  onPrevious,
  onSubmit,
  loading,
}: QuestionFormStepProps) {
  const { tryout_package_id } = useParams<{ tryout_package_id: string }>();
  const [previewQuestion, setPreviewQuestion] = useState<QuestionData | null>(
    null
  );
  const [pdfImportOpen, setPdfImportOpen] = useState(false);

  const handleAIGenerated = (index: number, generated: GeneratedQuestion) => {
    // Convert plain text to HTML for rich text editor
    // Wrap in paragraph tags and preserve line breaks
    const convertToHTML = (text: string) => {
      if (!text) return "";
      // Split by newlines and wrap each paragraph
      const paragraphs = text.split("\n").filter((p) => p.trim());
      if (paragraphs.length === 0) return `<p>${text}</p>`;
      return paragraphs.map((p) => `<p>${p}</p>`).join("");
    };

    // Fill question with HTML formatted content
    const questionHTML = convertToHTML(generated.question_text);
    const explanationHTML = convertToHTML(generated.explanation);

    onQuestionChange(index, "question_text", questionHTML);
    onQuestionChange(index, "correct_answer", generated.correct_answer);
    onQuestionChange(index, "explanation", explanationHTML);

    // Fill options with HTML formatted content
    generated.options.forEach((option, optIndex) => {
      const optionHTML = convertToHTML(option.text);
      onOptionChange(index, optIndex, optionHTML);
    });
  };

  return (
    <div className="space-y-6">
      {/* Questions List */}
      {questions.map((question, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <CardTitle>Soal #{question.question_number}</CardTitle>
                <Badge variant="secondary">{question.subject}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <AIGenerateButton
                  questionType={question.subject}
                  questionNumber={question.question_number}
                  onGenerated={(generated) =>
                    handleAIGenerated(index, generated)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewQuestion(question)}
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicateQuestion(index)}
                  title="Duplikat"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveQuestion(index)}
                    title="Hapus"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Question Text - Rich Text Editor */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Teks Pertanyaan <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                content={question.question_text}
                onChange={(content) =>
                  onQuestionChange(index, "question_text", content)
                }
                placeholder="Tulis pertanyaan di sini... (Bisa insert gambar, tabel, video YouTube)"
                minHeight="150px"
              />
            </div>

            {/* Options - Rich Text Editor for each */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Pilihan Jawaban <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-3">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          question.correct_answer === option.label
                            ? "default"
                            : "outline"
                        }
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {option.label}
                      </Badge>
                      <Label className="text-sm">Pilihan {option.label}</Label>
                    </div>
                    <RichTextEditor
                      content={option.text}
                      onChange={(content) =>
                        onOptionChange(index, optIndex, content)
                      }
                      placeholder={`Tulis pilihan ${option.label}...`}
                      minHeight="100px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Jawaban Benar <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={question.correct_answer}
                onValueChange={(value) =>
                  onQuestionChange(index, "correct_answer", value)
                }
                className="flex flex-wrap gap-4"
              >
                {question.options.map((option) => (
                  <div
                    key={option.label}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={option.label}
                      id={`correct-${index}-${option.label}`}
                    />
                    <Label
                      htmlFor={`correct-${index}-${option.label}`}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Explanation - Rich Text Editor */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Pembahasan / Penjelasan
              </Label>
              <RichTextEditor
                content={question.explanation}
                onChange={(content) =>
                  onQuestionChange(index, "explanation", content)
                }
                placeholder="Tulis pembahasan di sini... (Bisa insert gambar, tabel, video YouTube)"
                minHeight="150px"
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {/* Points */}
              <div>
                <Label htmlFor={`points-${index}`}>Poin</Label>
                <Input
                  id={`points-${index}`}
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) =>
                    onQuestionChange(
                      index,
                      "points",
                      parseInt(e.target.value) || 1
                    )
                  }
                  disabled={!config.differentPoints}
                  className="mt-1"
                />
              </div>

              {/* Difficulty */}
              {config.hasDifficulty && (
                <div>
                  <Label htmlFor={`difficulty-${index}`}>
                    Tingkat Kesulitan
                  </Label>
                  <Select
                    value={question.difficulty}
                    onValueChange={(value) =>
                      onQuestionChange(index, "difficulty", value)
                    }
                  >
                    <SelectTrigger id={`difficulty-${index}`} className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Mudah</SelectItem>
                      <SelectItem value="medium">Sedang</SelectItem>
                      <SelectItem value="hard">Sulit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Time Limit */}
              {config.hasTimePerQuestion && (
                <div>
                  <Label htmlFor={`time-${index}`}>Waktu (detik)</Label>
                  <Input
                    id={`time-${index}`}
                    type="number"
                    min="10"
                    value={question.time_limit || 60}
                    onChange={(e) =>
                      onQuestionChange(
                        index,
                        "time_limit",
                        parseInt(e.target.value) || 60
                      )
                    }
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Question Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          type="button"
          onClick={onAddQuestion}
          variant="outline"
          className="py-6 border-2 border-dashed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Soal Manual
        </Button>

        <Button
          type="button"
          onClick={() => setPdfImportOpen(true)}
          variant="outline"
          className="py-6 border-2 border-dashed"
        >
          <FileUp className="w-5 h-5 mr-2" />
          Import dari PDF (AI)
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-gray-50 dark:bg-gray-900 py-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan {questions.length} Soal...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan Semua Soal ({questions.length})
            </>
          )}
        </Button>
      </div>

      {/* Preview Modal */}
      <Dialog
        open={!!previewQuestion}
        onOpenChange={() => setPreviewQuestion(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Preview Soal #{previewQuestion?.question_number}
            </DialogTitle>
          </DialogHeader>
          {previewQuestion && (
            <div className="space-y-6">
              {/* Question */}
              <div>
                <h3 className="font-semibold mb-2">Pertanyaan:</h3>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: previewQuestion.question_text,
                  }}
                />
              </div>

              {/* Options */}
              <div>
                <h3 className="font-semibold mb-2">Pilihan Jawaban:</h3>
                <div className="space-y-3">
                  {previewQuestion.options.map((option) => (
                    <div
                      key={option.label}
                      className={`p-4 rounded-lg border-2 ${
                        previewQuestion.correct_answer === option.label
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={
                            previewQuestion.correct_answer === option.label
                              ? "default"
                              : "outline"
                          }
                        >
                          {option.label}
                        </Badge>
                        <div
                          className="prose dark:prose-invert max-w-none flex-1"
                          dangerouslySetInnerHTML={{ __html: option.text }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {previewQuestion.explanation && (
                <div>
                  <h3 className="font-semibold mb-2">Pembahasan:</h3>
                  <div
                    className="prose dark:prose-invert max-w-none p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                    dangerouslySetInnerHTML={{
                      __html: previewQuestion.explanation,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Import Dialog */}
      {tryout_package_id && (
        <PDFQuestionImport
          open={pdfImportOpen}
          onOpenChange={setPdfImportOpen}
          tryoutPackageId={tryout_package_id}
          onSuccess={() => {
            // Reload page to show imported questions
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
