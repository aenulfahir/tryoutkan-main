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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, Clock, FileText } from "lucide-react";
import type { TryoutPackage } from "@/types/tryout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const sectionSchema = z.object({
  name: z.string().min(1, "Nama bagian harus diisi"),
  total_questions: z.number().min(1, "Minimal 1 soal"),
  duration_minutes: z.number().min(1, "Minimal 1 menit"),
  description: z.string().optional(),
});

const tryoutSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  is_free: z.boolean(),
  is_active: z.boolean(),
  passing_grade: z.number().min(0).max(100, "Passing grade 0-100"),
});

type TryoutFormData = z.infer<typeof tryoutSchema>;
type SectionFormData = z.infer<typeof sectionSchema>;

interface TryoutFormWithSectionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tryout?: TryoutPackage | null;
  onSuccess?: () => void;
}

export default function TryoutFormWithSections({
  open,
  onOpenChange,
  tryout,
  onSuccess,
}: TryoutFormWithSectionsProps) {
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [sections, setSections] = useState<SectionFormData[]>([
    {
      name: "",
      total_questions: 0,
      duration_minutes: 0,
      description: "",
    },
  ]);

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
      price: 0,
      is_free: false,
      is_active: true,
      passing_grade: 70,
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
        price: tryout.price,
        is_free: tryout.is_free,
        is_active: tryout.is_active,
        passing_grade: tryout.passing_grade || 70,
      });
      setThumbnailPreview(tryout.thumbnail_url || "");

      // Load existing sections
      loadSections(tryout.id);
    } else {
      reset();
      setThumbnailPreview("");
      setSections([
        {
          name: "",
          total_questions: 0,
          duration_minutes: 0,
          description: "",
        },
      ]);
    }
  }, [tryout, reset]);

  const loadSections = async (tryoutId: string) => {
    try {
      const { data, error } = await supabase
        .from("tryout_sections")
        .select("*")
        .eq("tryout_package_id", tryoutId)
        .order("section_order");

      if (error) throw error;

      if (data && data.length > 0) {
        setSections(
          data.map((section) => ({
            name: section.section_name,
            total_questions: section.total_questions,
            duration_minutes: section.duration_minutes || 0,
            description: section.description || "",
          }))
        );
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        name: "",
        total_questions: 0,
        duration_minutes: 0,
        description: "",
      },
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const updateSection = (
    index: number,
    field: keyof SectionFormData,
    value: any
  ) => {
    setSections(
      sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    );
  };

  const calculateTotals = () => {
    const totalQuestions = sections.reduce(
      (sum, s) => sum + s.total_questions,
      0
    );
    const totalDuration = sections.reduce(
      (sum, s) => sum + s.duration_minutes,
      0
    );
    return { totalQuestions, totalDuration };
  };

  const onFormSubmit = async (data: TryoutFormData) => {
    try {
      setLoading(true);

      // Validate sections
      const validSections = sections.filter((s) => s.name.trim() !== "");
      if (validSections.length === 0) {
        toast.error("Minimal harus ada 1 bagian soal");
        return;
      }

      // Upload thumbnail if provided
      let thumbnailUrl = tryout?.thumbnail_url || "";
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("file", thumbnailFile);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("tryout-thumbnails")
          .upload(
            `thumbnails/${Date.now()}-${thumbnailFile.name}`,
            thumbnailFile
          );

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("tryout-thumbnails")
          .getPublicUrl(uploadData.path);

        thumbnailUrl = publicUrlData.publicUrl;
      }

      // Calculate total questions and duration from sections
      const { totalQuestions, totalDuration } = calculateTotals();

      const packageData = {
        ...data,
        thumbnail_url: thumbnailUrl,
        total_questions: totalQuestions,
        duration_minutes: totalDuration,
      };

      let packageId;
      if (tryout) {
        // Update
        const { error } = await supabase
          .from("tryout_packages")
          .update(packageData)
          .eq("id", tryout.id);

        if (error) throw error;
        packageId = tryout.id;
        toast.success("Tryout berhasil diupdate");
      } else {
        // Create
        const { data, error } = await supabase
          .from("tryout_packages")
          .insert(packageData)
          .select()
          .single();

        if (error) throw error;
        packageId = data.id;
        toast.success("Tryout berhasil dibuat");
      }

      // Save sections
      await saveSections(packageId, validSections);

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Gagal menyimpan tryout");
    } finally {
      setLoading(false);
    }
  };

  const saveSections = async (
    packageId: string,
    sectionsToSave: SectionFormData[]
  ) => {
    // Delete existing sections
    await supabase
      .from("tryout_sections")
      .delete()
      .eq("tryout_package_id", packageId);

    // Insert new sections
    const sectionsData = sectionsToSave.map((section, index) => ({
      tryout_package_id: packageId,
      section_name: section.name,
      total_questions: section.total_questions,
      duration_minutes: section.duration_minutes,
      description: section.description,
      section_order: index,
    }));

    const { error } = await supabase
      .from("tryout_sections")
      .insert(sectionsData);

    if (error) throw error;
  };

  const { totalQuestions, totalDuration } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <Separator />

          {/* Sections Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Rincian Bagian Soal</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSection}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Bagian
              </Button>
            </div>

            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Bagian {index + 1}</h4>
                    {sections.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`section-name-${index}`}>
                        Nama Bagian *
                      </Label>
                      <Input
                        id={`section-name-${index}`}
                        value={section.name}
                        onChange={(e) =>
                          updateSection(index, "name", e.target.value)
                        }
                        placeholder="Contoh: TWK, TIU, TKP"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`section-desc-${index}`}>Deskripsi</Label>
                      <Input
                        id={`section-desc-${index}`}
                        value={section.description || ""}
                        onChange={(e) =>
                          updateSection(index, "description", e.target.value)
                        }
                        placeholder="Deskripsi singkat"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`section-questions-${index}`}>
                        Jumlah Soal *
                      </Label>
                      <Input
                        id={`section-questions-${index}`}
                        type="number"
                        min="0"
                        value={section.total_questions}
                        onChange={(e) =>
                          updateSection(
                            index,
                            "total_questions",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor={`section-duration-${index}`}>
                        Durasi (menit) *
                      </Label>
                      <Input
                        id={`section-duration-${index}`}
                        type="number"
                        min="0"
                        value={section.duration_minutes}
                        onChange={(e) =>
                          updateSection(
                            index,
                            "duration_minutes",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sections.length > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>
                      Total Soal: <strong>{totalQuestions}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Total Durasi: <strong>{totalDuration} menit</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Price & Passing Grade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
