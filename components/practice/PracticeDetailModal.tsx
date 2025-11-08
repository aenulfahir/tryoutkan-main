import { Clock, Target, Users, Play, X, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PracticePackage } from "@/types/practice";
import { formatTime, getDifficultyColor, getCategoryLabel } from "@/services/practice";

interface PracticeDetailModalProps {
  package: PracticePackage;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function PracticeDetailModal({ package: pkg, isOpen, onClose, onStart }: PracticeDetailModalProps) {
  const handleStart = () => {
    onClose();
    onStart();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              {pkg.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              {pkg.description || "Latihan soal untuk meningkatkan kemampuan dan kecepatan Anda dalam mengerjakan soal."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Package Image */}
        {pkg.thumbnail_url && (
          <div className="mt-4">
            <img
              src={pkg.thumbnail_url}
              alt={pkg.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary">
            {getCategoryLabel(pkg.category)}
          </Badge>
          <Badge className={getDifficultyColor(pkg.difficulty)}>
            {pkg.difficulty === "easy" && "Mudah"}
            {pkg.difficulty === "medium" && "Sedang"}
            {pkg.difficulty === "hard" && "Sulit"}
          </Badge>
          {pkg.is_free && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Gratis
            </Badge>
          )}
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Timer Per Soal
          </Badge>
        </div>

        <Separator className="my-6" />

        {/* Practice Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Soal</p>
                  <p className="text-lg font-bold text-blue-600">{pkg.total_questions}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Waktu/Soal</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatTime(pkg.default_time_per_question)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Estimasi Total</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatTime(pkg.default_time_per_question * pkg.total_questions)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Features */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Fitur Latihan
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Timer per soal otomatis (pindah ke soal berikutnya saat waktu habis)
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Feedback langsung untuk setiap jawaban
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Penjelasan lengkap untuk setiap soal
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Statistik performa real-time
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Dapat dijeda kapan saja
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Sesi dapat dilanjutkan nanti
              </li>
            </ul>
          </div>

          {/* Practice Benefits */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Manfaat Latihan
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Meningkatkan kecepatan dan akurasi dalam mengerjakan soal
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Membiasakan diri dengan tekanan waktu per soal
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Mengidentifikasi area yang perlu diperbaiki
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Membangun strategi menjawab yang efektif
              </li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Petunjuk Latihan</h3>
            <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
              <li>Setiap soal memiliki waktu terbatas yang telah ditentukan</li>
              <li>Jika waktu habis, otomatis akan pindah ke soal berikutnya</li>
              <li>Anda akan mendapatkan feedback langsung setelah menjawab</li>
              <li>Penjelasan akan ditampilkan setelah Anda memilih jawaban</li>
              <li>Anda dapat menjeda latihan kapan saja</li>
              <li>Progress akan disimpan otomatis</li>
            </ol>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Mulai Latihan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}