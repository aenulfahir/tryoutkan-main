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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-black p-0 gap-0 bg-white sm:rounded-xl">
        {/* Header with gradient accent */}
        <div className="h-2 bg-black w-full"></div>

        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-black text-black mb-4 leading-tight">
                {tryout.title}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors border-2 border-black"
                >
                  {categoryInfo.icon} {categoryInfo.name}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-sm font-bold border-2 border-black text-black bg-transparent"
                >
                  {difficultyInfo.label}
                </Badge>
                {isPurchased && (
                  <Badge className="bg-gray-100 text-black border-2 border-black font-bold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sudah Dibeli
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 px-6 py-2">
          {/* Description */}
          {tryout.description && (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-100">
              <h4 className="font-bold text-black mb-3 text-lg">
                Deskripsi
              </h4>
              <p className="text-gray-700 leading-relaxed font-medium">
                {tryout.description}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4 p-5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                  Total Soal
                </p>
                <p className="text-xl font-black text-black">
                  {tryout.total_questions} soal
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                  Durasi
                </p>
                <p className="text-xl font-black text-black">
                  {totalDuration} menit
                </p>
                {sections.length > 0 && (
                  <p className="text-xs text-gray-500 font-medium">
                    {sections.length} bagian
                  </p>
                )}
              </div>
            </div>
            {tryout.passing_grade && (
              <div className="flex items-center space-x-4 p-5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                    Passing Grade
                  </p>
                  <p className="text-xl font-black text-black">
                    {tryout.passing_grade}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section Breakdown */}
          <div>
            <h4 className="font-bold text-black mb-4 text-lg">
              Rincian Soal per Bagian
            </h4>
            {loadingSections ? (
              <div className="flex items-center justify-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-black">
                            {section.section_name}
                          </span>
                          {section.description && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className="border-2 border-black text-black font-bold"
                      >
                        {section.total_questions} soal
                      </Badge>
                      {section.duration_minutes && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-black font-bold"
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
                    className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm font-bold text-black">
                        {section.name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-2 border-black text-black flex-shrink-0 font-bold"
                    >
                      {section.questions} soal
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-medium">
                  Belum ada bagian soal yang ditentukan
                </p>
              </div>
            )}
          </div>

          {/* Upload Date */}
          <div className="flex items-center space-x-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border-2 border-gray-100">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{formatDate(tryout.created_at)}</span>
          </div>

          {/* Price */}
          {!isPurchased && (
            <div className="bg-black p-6 rounded-xl border-2 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">
                    Harga Paket
                  </p>
                  {tryout.is_free ? (
                    <p className="text-3xl font-black text-white">GRATIS</p>
                  ) : (
                    <p className="text-3xl font-black text-white">
                      {formatPrice(tryout.price)}
                    </p>
                  )}
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 backdrop-blur-sm">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 p-6 border-t-2 border-gray-100 bg-gray-50/50 sm:rounded-b-xl">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-2 border-gray-200 hover:border-black hover:bg-white font-bold"
          >
            Tutup
          </Button>
          {isPurchased ? (
            <Button
              onClick={onStart}
              size="lg"
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800 px-8 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all"
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
              className="bg-black text-white hover:bg-gray-800 px-8 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all"
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
