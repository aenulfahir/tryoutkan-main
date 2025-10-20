import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  generateQuestion,
  isAIConfigured,
  getAIProvider,
  getExampleTopics,
  type GeneratedQuestion,
} from "@/services/aiQuestionGenerator";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
} from "lucide-react";

interface AIGenerateButtonProps {
  questionType: string;
  questionNumber?: number;
  onGenerated: (question: GeneratedQuestion) => void;
}

export function AIGenerateButton({
  questionType,
  questionNumber,
  onGenerated,
}: AIGenerateButtonProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [generatedQuestion, setGeneratedQuestion] =
    useState<GeneratedQuestion | null>(null);

  const exampleTopics = getExampleTopics(questionType);

  const handleGenerate = async () => {
    if (!isAIConfigured()) {
      toast.error(
        "AI belum dikonfigurasi. Tambahkan API key ke .env.local",
        {
          description:
            "Lihat dokumentasi di docs/AI_FEATURES_SETUP.md untuk setup",
        }
      );
      return;
    }

    try {
      setGenerating(true);
      setGeneratedQuestion(null);

      const question = await generateQuestion({
        questionType,
        topic: topic || undefined,
        difficulty,
        questionNumber,
      });

      setGeneratedQuestion(question);
      toast.success("Soal berhasil digenerate!", {
        description: `Menggunakan ${getAIProvider()}`,
      });
    } catch (error: any) {
      console.error("Error generating question:", error);
      toast.error("Gagal generate soal", {
        description: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleUseQuestion = () => {
    if (generatedQuestion) {
      onGenerated(generatedQuestion);
      setOpen(false);
      setGeneratedQuestion(null);
      setTopic("");
      toast.success("Soal berhasil digunakan!");
    }
  };

  const handleReset = () => {
    setGeneratedQuestion(null);
    setTopic("");
    setDifficulty("medium");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Generate dengan AI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Soal dengan AI
            </DialogTitle>
            <DialogDescription>
              AI akan membuat soal {questionType} lengkap dengan pilihan jawaban
              dan pembahasan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* AI Status */}
            {isAIConfigured() ? (
              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>
                  AI sudah dikonfigurasi: <strong>{getAIProvider()}</strong>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  AI belum dikonfigurasi. Tambahkan API key ke .env.local
                  <br />
                  <code className="text-xs">
                    VITE_OPENAI_API_KEY=sk-... atau VITE_GEMINI_API_KEY=...
                  </code>
                </AlertDescription>
              </Alert>
            )}

            {/* Configuration */}
            {!generatedQuestion && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jenis Soal</Label>
                    <Input value={questionType} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Tingkat Kesulitan</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(value: any) => setDifficulty(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Mudah</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="hard">Sulit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">
                    Topik Spesifik (Opsional)
                  </Label>
                  <Input
                    id="topic"
                    placeholder={`Contoh: ${exampleTopics[0]}`}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exampleTopics.map((example) => (
                      <Badge
                        key={example}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setTopic(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generated Question Preview */}
            {generatedQuestion && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Soal yang Digenerate:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={generating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Ulang
                  </Button>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Pertanyaan:
                  </Label>
                  <p className="text-sm bg-background p-3 rounded border">
                    {generatedQuestion.question_text}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Pilihan Jawaban:
                  </Label>
                  <div className="space-y-2">
                    {generatedQuestion.options.map((option) => (
                      <div
                        key={option.key}
                        className={`flex items-start gap-2 p-2 rounded border ${
                          option.key === generatedQuestion.correct_answer
                            ? "bg-green-50 dark:bg-green-950 border-green-500"
                            : "bg-background"
                        }`}
                      >
                        <span className="font-semibold text-sm min-w-[20px]">
                          {option.key}.
                        </span>
                        <span className="text-sm flex-1">{option.text}</span>
                        {option.key === generatedQuestion.correct_answer && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Jawaban Benar:
                  </Label>
                  <Badge variant="default" className="text-sm">
                    {generatedQuestion.correct_answer}
                  </Badge>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Pembahasan:
                  </Label>
                  <p className="text-sm bg-background p-3 rounded border">
                    {generatedQuestion.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {generatedQuestion ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={generating}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Ulang
                </Button>
                <Button onClick={handleUseQuestion}>
                  <Copy className="w-4 h-4 mr-2" />
                  Gunakan Soal Ini
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={generating}
                >
                  Batal
                </Button>
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Soal
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

