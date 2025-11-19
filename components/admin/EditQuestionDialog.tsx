import { useState, useEffect } from "react";
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
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string | null;
  onSuccess: () => void;
}

interface QuestionOption {
  id: string;
  option_key: string;
  option_text: string;
  option_text_html?: string;
}

export function EditQuestionDialog({
  open,
  onOpenChange,
  questionId,
  onSuccess,
}: EditQuestionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    question_number: 1,
    question_text: "",
    question_text_html: "",
    question_type: "multiple_choice",
    points: 5,
    correct_answer: "A",
    explanation: "",
    explanation_html: "",
  });
  const [options, setOptions] = useState<QuestionOption[]>([]);

  useEffect(() => {
    if (open && questionId) {
      loadQuestionData();
    }
  }, [open, questionId]);

  async function loadQuestionData() {
    if (!questionId) return;

    try {
      setLoadingData(true);

      // Load question
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (questionError) throw questionError;

      // Load options
      const { data: questionOptions, error: optionsError } = await supabase
        .from("question_options")
        .select("*")
        .eq("question_id", questionId)
        .order("option_key", { ascending: true });

      if (optionsError) throw optionsError;

      // Set form data
      setFormData({
        question_number: question.question_number,
        question_text: question.question_text || "",
        question_text_html: question.question_text_html || "",
        question_type: question.question_type || "multiple_choice",
        points: question.points || 5,
        correct_answer: question.correct_answer || "A",
        explanation: question.explanation || "",
        explanation_html: question.explanation_html || "",
      });

      setOptions(questionOptions || []);
    } catch (error: any) {
      console.error("Error loading question:", error);
      toast.error("Gagal memuat data soal: " + error.message);
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!questionId) return;

    try {
      setLoading(true);

      // Update question
      const { error: questionError } = await supabase
        .from("questions")
        .update({
          question_number: formData.question_number,
          question_text: formData.question_text,
          question_text_html: formData.question_text_html,
          question_type: formData.question_type,
          points: formData.points,
          correct_answer: formData.correct_answer,
          explanation: formData.explanation,
          explanation_html: formData.explanation_html,
          updated_at: new Date().toISOString(),
        })
        .eq("id", questionId);

      if (questionError) throw questionError;

      // Update options
      for (const option of options) {
        const { error: optionError } = await supabase
          .from("question_options")
          .update({
            option_text: option.option_text,
            option_text_html: option.option_text_html,
          })
          .eq("id", option.id);

        if (optionError) throw optionError;
      }

      toast.success("Soal berhasil diupdate!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating question:", error);
      toast.error("Gagal update soal: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOptionChange(optionId: string, field: string, value: string) {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      )
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="flex-shrink-0 border-b-2 border-black pb-4">
          <DialogTitle className="font-black text-2xl">Edit Soal</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 py-4">
                {/* Question Number & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_number" className="font-bold">Nomor Soal</Label>
                    <Input
                      id="question_number"
                      type="number"
                      min="1"
                      value={formData.question_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          question_number: parseInt(e.target.value),
                        })
                      }
                      required
                      className="border-2 border-black font-medium focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question_type" className="font-bold">Tipe Soal</Label>
                    <Select
                      value={formData.question_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, question_type: value })
                      }
                    >
                      <SelectTrigger className="border-2 border-black font-bold focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black font-medium">
                        <SelectItem value="multiple_choice">
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <Label className="font-bold">Pertanyaan</Label>
                  <div className="border-2 border-black rounded-md overflow-hidden">
                    <RichTextEditor
                      content={
                        formData.question_text_html || formData.question_text
                      }
                      onChange={(html) => {
                        setFormData({
                          ...formData,
                          question_text_html: html,
                          question_text: html.replace(/<[^>]*>/g, ""), // Strip HTML for plain text
                        });
                      }}
                      placeholder="Tulis pertanyaan di sini..."
                      minHeight="200px"
                    />
                  </div>
                </div>

                {/* Options */}
                {formData.question_type === "multiple_choice" && (
                  <div className="space-y-4">
                    <Label className="font-bold">Pilihan Jawaban</Label>
                    {options.map((option) => (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black w-8 text-lg">
                            {option.option_key}.
                          </span>
                          <div className="flex-1 border-2 border-black rounded-md overflow-hidden">
                            <RichTextEditor
                              content={
                                option.option_text_html || option.option_text
                              }
                              onChange={(html) => {
                                handleOptionChange(
                                  option.id,
                                  "option_text",
                                  html.replace(/<[^>]*>/g, "") // Strip HTML for plain text
                                );
                                handleOptionChange(
                                  option.id,
                                  "option_text_html",
                                  html
                                );
                              }}
                              placeholder={`Pilihan ${option.option_key}`}
                              minHeight="100px"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Correct Answer & Points */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="correct_answer" className="font-bold">Jawaban Benar</Label>
                    <Select
                      value={formData.correct_answer}
                      onValueChange={(value) =>
                        setFormData({ ...formData, correct_answer: value })
                      }
                    >
                      <SelectTrigger className="border-2 border-black font-bold focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black font-medium">
                        {options.map((opt) => (
                          <SelectItem
                            key={opt.option_key}
                            value={opt.option_key}
                          >
                            {opt.option_key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points" className="font-bold">Poin</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          points: parseInt(e.target.value),
                        })
                      }
                      required
                      className="border-2 border-black font-medium focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2 pb-6">
                  <Label className="font-bold">Pembahasan</Label>
                  <div className="border-2 border-black rounded-md overflow-hidden">
                    <RichTextEditor
                      content={formData.explanation_html || formData.explanation}
                      onChange={(html) => {
                        setFormData({
                          ...formData,
                          explanation_html: html,
                          explanation: html.replace(/<[^>]*>/g, ""), // Strip HTML for plain text
                        });
                      }}
                      placeholder="Tulis pembahasan di sini..."
                      minHeight="150px"
                    />
                  </div>
                </div>
              </div>
            </form>

            <DialogFooter className="flex-shrink-0 bg-white border-t-2 border-black pt-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="border-2 border-black font-bold hover:bg-gray-100"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
