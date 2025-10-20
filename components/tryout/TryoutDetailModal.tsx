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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-3">
                {tryout.title}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-sm">
                  {categoryInfo.icon} {categoryInfo.name}
                </Badge>
                <Badge
                  variant={
                    difficultyInfo.color === "green" ? "default" : "secondary"
                  }
                  className={
                    difficultyInfo.color === "yellow"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : difficultyInfo.color === "red"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : ""
                  }
                >
                  {difficultyInfo.label}
                </Badge>
                {isPurchased && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sudah Dibeli
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          {tryout.description && (
            <div>
              <h4 className="font-semibold mb-2">Deskripsi</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tryout.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Soal</p>
                <p className="font-semibold">{tryout.total_questions} soal</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Durasi</p>
                <p className="font-semibold">{totalDuration} menit</p>
                {sections.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Total dari {sections.length} bagian
                  </p>
                )}
              </div>
            </div>
            {tryout.passing_grade && (
              <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg col-span-2">
                <Award className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Passing Grade</p>
                  <p className="font-semibold">{tryout.passing_grade}%</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Section Breakdown */}
          <div>
            <h4 className="font-semibold mb-3">Rincian Soal per Bagian</h4>
            {loadingSections ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {section.section_name}
                        </span>
                        {section.description && (
                          <span className="text-xs text-muted-foreground">
                            ({section.description})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {section.total_questions} soal
                      </Badge>
                      {section.duration_minutes && (
                        <Badge variant="secondary">
                          {section.duration_minutes} menit
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : sectionBreakdown.length > 0 ? (
              <div className="space-y-2">
                {sectionBreakdown.map((section, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <span className="text-sm font-medium">{section.name}</span>
                    <Badge variant="outline">{section.questions} soal</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Belum ada bagian soal yang ditentukan</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Upload Date */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(tryout.created_at)}</span>
          </div>

          {/* Price */}
          {!isPurchased && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Harga Paket</p>
                  {tryout.is_free ? (
                    <p className="text-2xl font-bold text-green-600">GRATIS</p>
                  ) : (
                    <p className="text-2xl font-bold">
                      {formatPrice(tryout.price)}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Tutup
          </Button>
          {isPurchased ? (
            <Button onClick={onStart} size="lg" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Play className="w-4 h-4 mr-2" />
              Mulai Tryout
            </Button>
          ) : (
            <Button onClick={onPurchase} size="lg" disabled={loading}>
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
