import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { TryoutPackage, TryoutSection } from "@/types/tryout";

interface SectionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tryoutPackage: TryoutPackage | null;
}

// Section templates for different categories
// Note: The section_name should match the subject field used in the question form
const SECTION_TEMPLATES = {
  CPNS: [
    {
      name: "TWK",
      total_questions: 30,
      duration_minutes: 30,
      description: "Tes Wawasan Kebangsaan",
    },
    {
      name: "TIU",
      total_questions: 35,
      duration_minutes: 35,
      description: "Tes Intelegensi Umum",
    },
    {
      name: "TKP",
      total_questions: 45,
      duration_minutes: 45,
      description: "Tes Karakteristik Pribadi",
    },
  ],
  BUMN_TKD: [
    {
      name: "Verbal",
      total_questions: 33,
      duration_minutes: 30,
      description: "Kemampuan Verbal",
    },
    {
      name: "Numerik",
      total_questions: 33,
      duration_minutes: 30,
      description: "Kemampuan Numerik",
    },
    {
      name: "Logis",
      total_questions: 34,
      duration_minutes: 30,
      description: "Penalaran Logis",
    },
  ],
  BUMN_AKHLAK: [
    {
      name: "Situasional",
      total_questions: 45,
      duration_minutes: 40,
      description: "Tes Situasional",
    },
    {
      name: "Kepribadian",
      total_questions: 45,
      duration_minutes: 40,
      description: "Tes Kepribadian",
    },
  ],
  BUMN_TBI: [
    {
      name: "Structure",
      total_questions: 50,
      duration_minutes: 45,
      description: "Structure & Written Expression",
    },
    {
      name: "Reading",
      total_questions: 50,
      duration_minutes: 45,
      description: "Reading Comprehension",
    },
  ],
  STAN: [
    {
      name: "TWK",
      total_questions: 30,
      duration_minutes: 25,
      description: "Tes Wawasan Kebangsaan",
    },
    {
      name: "TIU",
      total_questions: 35,
      duration_minutes: 30,
      description: "Tes Intelegensi Umum",
    },
    {
      name: "TKP",
      total_questions: 35,
      duration_minutes: 25,
      description: "Tes Karakteristik Pribadi",
    },
  ],
  PLN: [
    {
      name: "Akademik",
      total_questions: 50,
      duration_minutes: 60,
      description: "Tes Akademik",
    },
    {
      name: "Teknis",
      total_questions: 50,
      duration_minutes: 60,
      description: "Tes Teknis",
    },
  ],
  OTHER: [
    {
      name: "Umum",
      total_questions: 30,
      duration_minutes: 30,
      description: "Bagian Umum",
    },
  ],
};

export default function SectionManager({
  open,
  onOpenChange,
  tryoutPackage,
}: SectionManagerProps) {
  const [sections, setSections] = useState<TryoutSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    id: "",
    section_name: "",
    total_questions: 0,
    duration_minutes: 0,
    description: "",
    section_order: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (open && tryoutPackage) {
      loadSections();
    }
  }, [open, tryoutPackage]);

  const loadSections = async () => {
    if (!tryoutPackage) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tryout_sections")
        .select("*")
        .eq("tryout_package_id", tryoutPackage.id)
        .order("section_order");

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error loading sections:", error);
      toast.error("Gagal memuat bagian soal");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSectionForm({
      id: "",
      section_name: "",
      total_questions: 0,
      duration_minutes: 0,
      description: "",
      section_order: sections.length,
    });
    setIsEditing(false);
  };

  const handleAddSection = () => {
    resetForm();
    setFormOpen(true);
  };

  const handleEditSection = (section: TryoutSection) => {
    setSectionForm({
      id: section.id,
      section_name: section.section_name,
      total_questions: section.total_questions,
      duration_minutes: section.duration_minutes || 0,
      description: section.description || "",
      section_order: section.section_order,
    });
    setIsEditing(true);
    setFormOpen(true);
  };

  const handleSaveSection = async () => {
    if (!tryoutPackage) return;

    try {
      if (isEditing) {
        // Update existing section
        const { error } = await supabase
          .from("tryout_sections")
          .update({
            section_name: sectionForm.section_name,
            total_questions: sectionForm.total_questions,
            duration_minutes: sectionForm.duration_minutes,
            description: sectionForm.description,
            section_order: sectionForm.section_order,
          })
          .eq("id", sectionForm.id);

        if (error) throw error;
        toast.success("Bagian soal berhasil diperbarui");
      } else {
        // Create new section
        const { error } = await supabase.from("tryout_sections").insert({
          tryout_package_id: tryoutPackage.id,
          section_name: sectionForm.section_name,
          total_questions: sectionForm.total_questions,
          duration_minutes: sectionForm.duration_minutes,
          description: sectionForm.description,
          section_order: sections.length,
        });

        if (error) throw error;
        toast.success("Bagian soal berhasil ditambahkan");
      }

      await loadSections();
      setFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Gagal menyimpan bagian soal");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from("tryout_sections")
        .delete()
        .eq("id", sectionId);

      if (error) throw error;
      toast.success("Bagian soal berhasil dihapus");
      await loadSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Gagal menghapus bagian soal");
    }
  };

  const handleUseTemplate = async () => {
    if (!tryoutPackage) return;

    const templates =
      SECTION_TEMPLATES[tryoutPackage.category] || SECTION_TEMPLATES.OTHER;

    try {
      setLoading(true);

      // Clear existing sections
      await supabase
        .from("tryout_sections")
        .delete()
        .eq("tryout_package_id", tryoutPackage.id);

      // Add template sections
      const sectionsToInsert = templates.map((template, index) => ({
        tryout_package_id: tryoutPackage.id,
        section_name: template.name,
        total_questions: template.total_questions,
        duration_minutes: template.duration_minutes,
        description: template.description,
        section_order: index,
      }));

      const { error } = await supabase
        .from("tryout_sections")
        .insert(sectionsToInsert);

      if (error) throw error;
      toast.success("Template bagian soal berhasil diterapkan");
      await loadSections();
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Gagal menerapkan template");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (field: "total_questions" | "duration_minutes") => {
    return sections.reduce(
      (total, section) => total + (section[field] || 0),
      0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black text-xl">
            <FileText className="w-5 h-5" />
            Kelola Bagian Soal - {tryoutPackage?.title}
          </DialogTitle>
          <DialogDescription className="font-medium text-gray-600">
            Atur bagian-bagian soal untuk paket tryout ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black p-4 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-black" />
                <span className="font-bold">Total Soal</span>
              </div>
              <p className="text-2xl font-black text-black">
                {calculateTotal("total_questions")}
              </p>
              <p className="text-sm font-medium text-gray-600">
                Dari {sections.length} bagian
              </p>
            </div>
            <div className="bg-white border-2 border-black p-4 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-black" />
                <span className="font-bold">Total Durasi</span>
              </div>
              <p className="text-2xl font-black text-black">
                {calculateTotal("duration_minutes")} menit
              </p>
              <p className="text-sm font-medium text-gray-600">
                Dari {sections.length} bagian
              </p>
            </div>
          </div>

          {/* Template Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              Gunakan template untuk kategori {tryoutPackage?.category}
            </p>
            <Button
              variant="outline"
              onClick={handleUseTemplate}
              disabled={loading}
              className="border-2 border-black font-bold hover:bg-gray-100"
            >
              Gunakan Template
            </Button>
          </div>

          <Separator className="bg-black" />

          {/* Sections List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">Daftar Bagian Soal</h3>
              <Button
                onClick={handleAddSection}
                size="sm"
                className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Bagian
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-gray-500">Belum ada bagian soal</p>
                <p className="text-sm text-gray-400">
                  Tambah bagian soal atau gunakan template
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-start justify-between p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-2 border-black font-bold">Bagian {index + 1}</Badge>
                        <h4 className="font-black text-lg">
                          {section.section_name}
                        </h4>
                      </div>
                      {section.description && (
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          {section.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm font-bold">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {section.total_questions} soal
                        </span>
                        {section.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {section.duration_minutes} menit
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSection(section)}
                        className="hover:bg-gray-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader>
              <DialogTitle className="font-black text-xl">
                {isEditing ? "Edit Bagian Soal" : "Tambah Bagian Soal"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="section_name" className="font-bold">Nama Bagian *</Label>
                <Input
                  id="section_name"
                  value={sectionForm.section_name}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      section_name: e.target.value,
                    })
                  }
                  placeholder="Contoh: TWK, TIU, TKP (harus cocok dengan subject di form soal)"
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Nama bagian harus cocok dengan subject yang digunakan di form
                  soal
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_questions" className="font-bold">Jumlah Soal *</Label>
                  <Input
                    id="total_questions"
                    type="number"
                    value={sectionForm.total_questions}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        total_questions: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 border-black font-medium focus-visible:ring-0"
                  />
                </div>
                <div>
                  <Label htmlFor="duration_minutes" className="font-bold">Durasi (menit) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={sectionForm.duration_minutes}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        duration_minutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 border-black font-medium focus-visible:ring-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="font-bold">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Deskripsi singkat tentang bagian ini"
                  rows={3}
                  className="border-2 border-black font-medium focus-visible:ring-0"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="border-2 border-black font-bold hover:bg-gray-100"
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveSection}
                className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 border-black font-bold hover:bg-gray-100"
          >
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
