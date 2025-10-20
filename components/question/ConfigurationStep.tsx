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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Info, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuestionConfig {
  category: string;
  subject: string;
  customSubject: string;
  totalQuestions: number;
  answerType: "yes-no" | "abcde" | "custom";
  customOptionsCount: number;
  defaultPoints: number;
  differentPoints: boolean;
  hasTimePerQuestion: boolean;
  hasDifficulty: boolean;
}

interface ConfigurationStepProps {
  config: QuestionConfig;
  onChange: (field: keyof QuestionConfig, value: any) => void;
  onNext: () => void;
  existingCount: number;
  tryoutPackage?: any;
  questionBreakdown?: { [key: string]: number };
}

export function ConfigurationStep({
  config,
  onChange,
  onNext,
  existingCount,
  tryoutPackage,
  questionBreakdown = {},
}: ConfigurationStepProps) {
  const totalTarget = tryoutPackage?.total_questions || 0;
  const totalExisting = existingCount;
  const remaining = totalTarget - totalExisting;

  // Calculate breakdown
  const twkCount = questionBreakdown["TWK"] || 0;
  const tiuCount = questionBreakdown["TIU"] || 0;
  const tkpCount = questionBreakdown["TKP"] || 0;

  return (
    <div className="space-y-6">
      {/* Package Info Alert */}
      {tryoutPackage && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Informasi Paket Tryout</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Kategori:</span>{" "}
                {tryoutPackage.category}
              </div>
              <div>
                <span className="font-semibold">Target Total Soal:</span>{" "}
                {totalTarget}
              </div>
              <div>
                <span className="font-semibold">Soal Sudah Ada:</span>{" "}
                {totalExisting}
              </div>
              <div>
                <span className="font-semibold">Soal Kurang:</span>{" "}
                <span
                  className={
                    remaining > 0
                      ? "text-orange-600 font-bold"
                      : "text-green-600 font-bold"
                  }
                >
                  {remaining}
                </span>
              </div>
            </div>

            {/* Breakdown by Subject */}
            <div className="mt-4 pt-4 border-t">
              <p className="font-semibold text-sm mb-2">
                Breakdown Soal per Kategori:
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <div className="font-semibold text-blue-700 dark:text-blue-300">
                    TWK
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {twkCount}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    soal
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <div className="font-semibold text-green-700 dark:text-green-300">
                    TIU
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {tiuCount}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    soal
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                  <div className="font-semibold text-purple-700 dark:text-purple-300">
                    TKP
                  </div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {tkpCount}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    soal
                  </div>
                </div>
              </div>
            </div>

            {remaining > 0 && (
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-3 font-medium">
                ⚠️ Anda masih perlu menambahkan {remaining} soal lagi untuk
                mencapai target {totalTarget} soal.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Subject */}
      <Card>
        <CardHeader>
          <CardTitle>Jenis Mata Pelajaran / Subtest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={config.subject}
            onValueChange={(value) => onChange("subject", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TWK" id="twk" />
              <Label htmlFor="twk">TWK (Tes Wawasan Kebangsaan)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TIU" id="tiu" />
              <Label htmlFor="tiu">TIU (Tes Intelegensia Umum)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TKP" id="tkp" />
              <Label htmlFor="tkp">TKP (Tes Karakteristik Pribadi)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom (Input Manual)</Label>
            </div>
          </RadioGroup>

          {config.subject === "custom" && (
            <Input
              placeholder="Masukkan nama mata pelajaran"
              value={config.customSubject}
              onChange={(e) => onChange("customSubject", e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      {/* Total Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Jumlah Soal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="totalQuestions">Total soal yang akan dibuat</Label>
            <Input
              id="totalQuestions"
              type="number"
              min="1"
              value={config.totalQuestions}
              onChange={(e) =>
                onChange("totalQuestions", parseInt(e.target.value) || 1)
              }
              className="mt-2"
            />
          </div>

          {existingCount > 0 && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Sudah ada <strong>{existingCount} soal</strong> sebelumnya. Akan
                menambahkan <strong>{config.totalQuestions} soal</strong> lagi
                (total: {existingCount + config.totalQuestions} soal).
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Answer Type */}
      <Card>
        <CardHeader>
          <CardTitle>Tipe Pilihan Jawaban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={config.answerType}
            onValueChange={(value: any) => onChange("answerType", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes-no" id="yes-no" />
              <Label htmlFor="yes-no">Ya / Tidak (2 pilihan)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="abcde" id="abcde" />
              <Label htmlFor="abcde">A / B / C / D / E (5 pilihan)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom-options" />
              <Label htmlFor="custom-options">Custom (Tentukan jumlah)</Label>
            </div>
          </RadioGroup>

          {config.answerType === "custom" && (
            <div>
              <Label htmlFor="customOptionsCount">Jumlah pilihan</Label>
              <Input
                id="customOptionsCount"
                type="number"
                min="2"
                max="10"
                value={config.customOptionsCount}
                onChange={(e) =>
                  onChange("customOptionsCount", parseInt(e.target.value) || 2)
                }
                className="mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points */}
      <Card>
        <CardHeader>
          <CardTitle>Poin per Soal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defaultPoints">Poin default</Label>
            <Input
              id="defaultPoints"
              type="number"
              min="1"
              value={config.defaultPoints}
              onChange={(e) =>
                onChange("defaultPoints", parseInt(e.target.value) || 1)
              }
              className="mt-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="differentPoints"
              checked={config.differentPoints}
              onCheckedChange={(checked) =>
                onChange("differentPoints", checked)
              }
            />
            <Label htmlFor="differentPoints">
              Poin berbeda per soal (bisa set manual nanti)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle>Opsi Tambahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasTimePerQuestion"
              checked={config.hasTimePerQuestion}
              onCheckedChange={(checked) =>
                onChange("hasTimePerQuestion", checked)
              }
            />
            <Label htmlFor="hasTimePerQuestion">
              Soal memiliki waktu per soal (dalam detik)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasDifficulty"
              checked={config.hasDifficulty}
              onCheckedChange={(checked) => onChange("hasDifficulty", checked)}
            />
            <Label htmlFor="hasDifficulty">
              Soal memiliki tingkat kesulitan (Mudah/Sedang/Sulit)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Lanjut ke Pembuatan Soal
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
