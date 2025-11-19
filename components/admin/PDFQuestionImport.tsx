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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  extractQuestionsFromPDF,
  isAIConfigured,
  getAIProvider,
  type ExtractedQuestion,
} from "@/services/aiQuestionExtractor";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { QuestionImportPreview } from "./QuestionImportPreview";

interface PDFQuestionImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tryoutPackageId: string;
  onSuccess: () => void;
}

export function PDFQuestionImport({
  open,
  onOpenChange,
  tryoutPackageId,
  onSuccess,
}: PDFQuestionImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<
    ExtractedQuestion[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        toast.error("File harus berformat PDF");
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB");
        return;
      }

      setFile(selectedFile);
      setExtractedQuestions([]);
      setErrors([]);
      setShowPreview(false);
    }
  };

  const handleExtract = async () => {
    if (!file) {
      toast.error("Pilih file PDF terlebih dahulu");
      return;
    }

    if (!isAIConfigured()) {
      toast.error(
        "AI belum dikonfigurasi. Tambahkan API key ke .env.local",
        {
          description:
            "Lihat dokumentasi di services/aiQuestionExtractor.ts untuk setup",
        }
      );
      return;
    }

    try {
      setExtracting(true);
      setErrors([]);

      const result = await extractQuestionsFromPDF(file);

      if (!result.success) {
        setErrors(result.errors);
        toast.error("Gagal ekstrak soal dari PDF", {
          description: result.errors[0],
        });
        return;
      }

      if (result.questions.length === 0) {
        toast.error("Tidak ada soal yang berhasil diekstrak");
        return;
      }

      setExtractedQuestions(result.questions);
      setErrors(result.errors);
      setShowPreview(true);

      toast.success(`Berhasil ekstrak ${result.totalExtracted} soal!`, {
        description: `Menggunakan ${getAIProvider()}`,
      });
    } catch (error: any) {
      console.error("Error extracting questions:", error);
      toast.error("Gagal ekstrak soal", {
        description: error.message,
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedQuestions([]);
    setErrors([]);
    setShowPreview(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showPreview} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">Import Soal dari PDF dengan AI</DialogTitle>
            <DialogDescription className="font-medium text-gray-600">
              Upload file PDF berisi soal, AI akan otomatis mendeteksi dan
              mengekstrak soal beserta pilihan jawaban.
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

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="pdf-file" className="font-bold">File PDF</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={extracting}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
                {file && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    disabled={extracting}
                    className="hover:bg-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                  <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <Alert variant="destructive" className="border-2 border-red-600 bg-red-50">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="font-medium">
                  <div className="font-bold mb-2">
                    Peringatan ({errors.length}):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {errors.length > 5 && (
                      <li>... dan {errors.length - 5} lainnya</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="bg-gray-100 border-2 border-black p-4 rounded-lg space-y-2 text-sm">
              <p className="font-black">Tips untuk hasil terbaik:</p>
              <ul className="list-disc list-inside space-y-1 font-medium text-gray-600">
                <li>Pastikan PDF berisi teks (bukan scan gambar)</li>
                <li>Format soal harus jelas (nomor, pertanyaan, pilihan)</li>
                <li>Sertakan jawaban dan pembahasan jika ada</li>
                <li>Maksimal 10MB per file</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={extracting}
              className="border-2 border-black font-bold hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              onClick={handleExtract}
              disabled={!file || extracting}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengekstrak...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ekstrak Soal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {showPreview && (
        <QuestionImportPreview
          open={showPreview}
          onOpenChange={setShowPreview}
          questions={extractedQuestions}
          tryoutPackageId={tryoutPackageId}
          onSuccess={() => {
            handleReset();
            onSuccess();
          }}
          onBack={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
