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
        className="gap-2 border-2 border-black font-bold hover:bg-gray-100"
      >
        <Sparkles className="w-4 h-4" />
        Generate dengan AI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black text-xl">
              <Sparkles className="w-5 h-5" />
              Generate Soal dengan AI
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-600">
              AI akan membuat soal {questionType} lengkap dengan pilihan jawaban
              dan pembahasan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* AI Status */}
            {isAIConfigured() ? (
              <Alert className="border-2 border-black bg-gray-50">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <AlertDescription className="font-medium text-black">
                  AI sudah dikonfigurasi: <strong>{getAIProvider()}</strong>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="border-2 border-red-600 bg-red-50">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="font-medium">
                  AI belum dikonfigurasi. Tambahkan API key ke .env.local
                  <br />
                  <code className="text-xs font-bold">
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
                    <Label className="font-bold">Jenis Soal</Label>
                    <Input value={questionType} disabled className="border-2 border-black font-medium bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Tingkat Kesulitan</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(value: any) => setDifficulty(value)}
                    >
                      <SelectTrigger className="border-2 border-black font-bold focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black font-medium">
                        <SelectItem value="easy">Mudah</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="hard">Sulit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="font-bold">
                    Topik Spesifik (Opsional)
                  </Label>
                  <Input
                    id="topic"
                    placeholder={`Contoh: ${exampleTopics[0]}`}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="border-2 border-black font-medium focus-visible:ring-0"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exampleTopics.map((example) => (
                      <Badge
                        key={example}
                        variant="outline"
                        className="cursor-pointer hover:bg-black hover:text-white border-2 border-black font-bold transition-colors"
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
              <div className="space-y-4 border-2 border-black rounded-lg p-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg">Soal yang Digenerate:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={generating}
                    className="hover:bg-gray-100"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Ulang
                  </Button>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500">
                    Pertanyaan:
                  </Label>
                  <p className="text-sm bg-gray-50 p-3 rounded border-2 border-black font-medium">
                    {generatedQuestion.question_text}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500">
                    Pilihan Jawaban:
                  </Label>
                  <div className="space-y-2">
                    {generatedQuestion.options.map((option) => (
                      <div
                        key={option.key}
                        className={`flex items-start gap-2 p-2 rounded border-2 ${option.key === generatedQuestion.correct_answer
                            ? "bg-green-50 border-green-600"
                            : "bg-white border-black"
                          }`}
                      >
                        <span className="font-black text-sm min-w-[20px]">
                          {option.key}.
                        </span>
                        <span className="text-sm font-medium flex-1">{option.text}</span>
                        {option.key === generatedQuestion.correct_answer && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500">
                    Jawaban Benar:
                  </Label>
                  <Badge variant="default" className="text-sm font-bold bg-black text-white border-2 border-black">
                    {generatedQuestion.correct_answer}
                  </Badge>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500">
                    Pembahasan:
                  </Label>
                  <p className="text-sm bg-gray-50 p-3 rounded border-2 border-black font-medium">
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
                  className="border-2 border-black font-bold hover:bg-gray-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Ulang
                </Button>
                <Button
                  onClick={handleUseQuestion}
                  className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
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
                  className="border-2 border-black font-bold hover:bg-gray-100"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
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
