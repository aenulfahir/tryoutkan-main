import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  FileText,
  Award,
  Calendar,
  ShoppingCart,
  Play,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { CATEGORY_INFO, DIFFICULTY_INFO } from "@/types/tryout";
import type { TryoutPackage, TryoutSection } from "@/types/tryout";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface TryoutDetailModalProps {
  tryout: TryoutPackage | null;
  isPurchased: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: () => void;
  onStart: () => void;
  loading?: boolean;
}

export function TryoutDetailModal({
  tryout,
  isPurchased,
  open,
  onOpenChange,
  onPurchase,
  onStart,
  loading = false,
}: TryoutDetailModalProps) {
  const [sections, setSections] = useState<TryoutSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Load sections when tryout changes
  useEffect(() => {
    if (tryout && open) {
      loadSections();
    }
  }, [tryout, open]);

  const loadSections = async () => {
    if (!tryout) return;

    try {
      setLoadingSections(true);
      const { data, error } = await supabase
        .from("tryout_sections")
        .select("*")
        .eq("tryout_package_id", tryout.id)
        .order("section_order");

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error loading sections:", error);
    } finally {
      setLoadingSections(false);
    }
  };

  if (!tryout) return null;

  const categoryInfo = CATEGORY_INFO[tryout.category];
  const difficultyInfo = DIFFICULTY_INFO[tryout.difficulty];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return "Dibuat minggu ini";
    } else if (diffDays < 30) {
      return "Dibuat bulan ini";
    } else if (diffDays < 60) {
      return "Dibuat bulan lalu";
    } else {
      return `Dibuat pada ${date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
    }
  };

  // Section breakdown (fallback data if no sections in database)
  const getSectionBreakdown = () => {
    switch (tryout.category) {
      case "CPNS":
        return [
          { name: "TWK (Tes Wawasan Kebangsaan)", questions: 30 },
          { name: "TIU (Tes Intelegensi Umum)", questions: 35 },
          { name: "TKP (Tes Karakteristik Pribadi)", questions: 45 },
        ];
      case "BUMN_TKD":
        return [
          { name: "Kemampuan Verbal", questions: 33 },
          { name: "Kemampuan Numerik", questions: 33 },
          { name: "Penalaran Logis", questions: 34 },
        ];
      case "BUMN_AKHLAK":
        return [
          { name: "Tes Situasional", questions: 45 },
          { name: "Tes Kepribadian", questions: 45 },
        ];
      case "BUMN_TBI":
        return [
          { name: "Structure & Written Expression", questions: 50 },
          { name: "Reading Comprehension", questions: 50 },
        ];
      case "STAN":
        return [
          { name: "Tes Wawasan Kebangsaan", questions: 30 },
          { name: "Tes Intelegensi Umum", questions: 35 },
          { name: "Tes Karakteristik Pribadi", questions: 35 },
        ];
      case "PLN":
        return [
          { name: "Tes Akademik", questions: 50 },
          { name: "Tes Teknis", questions: 50 },
        ];
      default:
        return [];
    }
  };

  // Calculate total duration from sections
  const calculateTotalDuration = () => {
    if (sections.length > 0) {
      return sections.reduce(
        (total, section) => total + (section.duration_minutes || 0),
        0
      );
    }
    return tryout.duration_minutes;
  };

  const totalDuration = calculateTotalDuration();
  const sectionBreakdown = getSectionBreakdown();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-gray-200">
        {/* Header with gradient accent */}
        <div className="h-2 bg-gradient-to-r from-gray-900 to-black"></div>

        <DialogHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {tryout.title}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  {categoryInfo.icon} {categoryInfo.name}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-sm font-medium ${
                    difficultyInfo.color === "yellow"
                      ? "border-yellow-400 text-yellow-700 bg-yellow-50"
                      : difficultyInfo.color === "red"
                      ? "border-red-400 text-red-700 bg-red-50"
                      : "border-green-400 text-green-700 bg-green-50"
                  }`}
                >
                  {difficultyInfo.label}
                </Badge>
                {isPurchased && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sudah Dibeli
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 py-2">
          {/* Description */}
          {tryout.description && (
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                Deskripsi
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {tryout.description}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-gray-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Total Soal
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {tryout.total_questions} soal
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-gray-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Durasi
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {totalDuration} menit
                </p>
                {sections.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {sections.length} bagian
                  </p>
                )}
              </div>
            </div>
            {tryout.passing_grade && (
              <div className="flex items-center space-x-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-gray-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Passing Grade
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {tryout.passing_grade}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section Breakdown */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Rincian Soal per Bagian
            </h4>
            {loadingSections ? (
              <div className="flex items-center justify-center py-8 bg-gray-50 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-gray-900">
                            {section.section_name}
                          </span>
                          {section.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className="border-gray-300 text-gray-700"
                      >
                        {section.total_questions} soal
                      </Badge>
                      {section.duration_minutes && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700"
                        >
                          {section.duration_minutes} menit
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : sectionBreakdown.length > 0 ? (
              <div className="space-y-3">
                {sectionBreakdown.map((section, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {section.name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-gray-300 text-gray-700 flex-shrink-0"
                    >
                      {section.questions} soal
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">
                  Belum ada bagian soal yang ditentukan
                </p>
              </div>
            )}
          </div>

          {/* Upload Date */}
          <div className="flex items-center space-x-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(tryout.created_at)}</span>
          </div>

          {/* Price */}
          {!isPurchased && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Harga Paket
                  </p>
                  {tryout.is_free ? (
                    <p className="text-3xl font-bold text-green-600">GRATIS</p>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPrice(tryout.price)}
                    </p>
                  )}
                </div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <ShoppingCart className="w-8 h-8 text-gray-700" />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-gray-300 hover:bg-gray-50"
          >
            Tutup
          </Button>
          {isPurchased ? (
            <Button
              onClick={onStart}
              size="lg"
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800 px-8"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Play className="w-4 h-4 mr-2" />
              Mulai Tryout
            </Button>
          ) : (
            <Button
              onClick={onPurchase}
              size="lg"
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800 px-8"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <ShoppingCart className="w-4 h-4 mr-2" />
              {tryout.is_free
                ? "Ambil Gratis"
                : `Beli Paket - ${formatPrice(tryout.price)}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
