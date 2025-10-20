import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { TryoutPackage } from "@/types/tryout";

const tryoutSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  duration_minutes: z.number().min(1, "Durasi minimal 1 menit"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  is_free: z.boolean(),
  is_active: z.boolean(),
  passing_grade: z.number().min(0).max(100, "Passing grade 0-100"),
  total_questions: z.number().min(1, "Minimal 1 soal"),
});

type TryoutFormData = z.infer<typeof tryoutSchema>;

interface TryoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tryout?: TryoutPackage | null;
  onSubmit: (data: TryoutFormData, thumbnail?: File) => Promise<void>;
}

export default function TryoutForm({
  open,
  onOpenChange,
  tryout,
  onSubmit,
}: TryoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TryoutFormData>({
    resolver: zodResolver(tryoutSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      difficulty: "medium",
      duration_minutes: 90,
      price: 0,
      is_free: false,
      is_active: true,
      passing_grade: 70,
      total_questions: 0,
    },
  });

  const isFree = watch("is_free");

  useEffect(() => {
    if (tryout) {
      reset({
        title: tryout.title,
        description: tryout.description || "",
        category: tryout.category,
        difficulty: tryout.difficulty as "easy" | "medium" | "hard",
        duration_minutes: tryout.duration_minutes,
        price: tryout.price,
        is_free: tryout.is_free,
        is_active: tryout.is_active,
        passing_grade: tryout.passing_grade || 70,
        total_questions: tryout.total_questions,
      });
      setThumbnailPreview(tryout.thumbnail_url || "");
    } else {
      reset();
      setThumbnailPreview("");
    }
  }, [tryout, reset]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: TryoutFormData) => {
    try {
      setLoading(true);
      await onSubmit(data, thumbnail || undefined);
      onOpenChange(false);
      reset();
      setThumbnail(null);
      setThumbnailPreview("");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tryout ? "Edit Tryout" : "Tambah Tryout Baru"}
          </DialogTitle>
          <DialogDescription>
            {tryout
              ? "Update informasi paket tryout"
              : "Buat paket tryout baru untuk siswa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Judul Tryout *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Contoh: CPNS 2024 - Paket 1"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Deskripsi lengkap tentang tryout ini..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPNS">🏛️ CPNS</SelectItem>
                  <SelectItem value="BUMN_TKD">🏢 BUMN TKD</SelectItem>
                  <SelectItem value="BUMN_AKHLAK">⭐ BUMN AKHLAK</SelectItem>
                  <SelectItem value="BUMN_TBI">🌐 BUMN TBI</SelectItem>
                  <SelectItem value="STAN">🎓 STAN</SelectItem>
                  <SelectItem value="PLN">⚡ PLN</SelectItem>
                  <SelectItem value="OTHER">📝 Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="difficulty">Tingkat Kesulitan *</Label>
              <Select
                value={watch("difficulty")}
                onValueChange={(value) =>
                  setValue("difficulty", value as "easy" | "medium" | "hard")
                }
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

          {/* Duration & Total Questions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration_minutes">Durasi (menit) *</Label>
              <Input
                id="duration_minutes"
                type="number"
                {...register("duration_minutes", { valueAsNumber: true })}
              />
              {errors.duration_minutes && (
                <p className="text-sm text-destructive mt-1">
                  {errors.duration_minutes.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="total_questions">Total Soal *</Label>
              <Input
                id="total_questions"
                type="number"
                {...register("total_questions", { valueAsNumber: true })}
              />
              {errors.total_questions && (
                <p className="text-sm text-destructive mt-1">
                  {errors.total_questions.message}
                </p>
              )}
            </div>
          </div>

          {/* Price & Passing Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Harga (Rp) *</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                disabled={isFree}
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="passing_grade">Passing Grade (%) *</Label>
              <Input
                id="passing_grade"
                type="number"
                {...register("passing_grade", { valueAsNumber: true })}
              />
              {errors.passing_grade && (
                <p className="text-sm text-destructive mt-1">
                  {errors.passing_grade.message}
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_free">Gratis</Label>
              <Switch
                id="is_free"
                checked={watch("is_free")}
                onCheckedChange={(checked) => setValue("is_free", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Aktif</Label>
              <Switch
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {tryout ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
