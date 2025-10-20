import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import { EditQuestionDialog } from "@/components/admin/EditQuestionDialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Question {
  id: string;
  tryout_package_id: string;
  question_number: number;
  question_text: string;
  question_type: string;
  section_id: string;
  points: number;
  options: any;
  correct_answer: string;
  explanation: string;
}

export default function AdminQuestionList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get("package");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (packageId) {
      loadQuestions();
    }
  }, [packageId]);

  async function loadQuestions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("tryout_package_id", packageId)
        .order("question_number", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Gagal memuat soal");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedQuestion) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", selectedQuestion.id);

      if (error) throw error;

      toast.success("Soal berhasil dihapus");
      loadQuestions();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Gagal menghapus soal");
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      key: "question_number",
      label: "No",
      render: (item: Question) => (
        <span className="font-medium">{item.question_number}</span>
      ),
    },
    {
      key: "question_text",
      label: "Pertanyaan",
      render: (item: Question) => (
        <div className="max-w-md">
          <p className="line-clamp-2">{item.question_text}</p>
        </div>
      ),
    },
    {
      key: "question_type",
      label: "Tipe",
      render: (item: Question) => (
        <Badge variant="outline">{item.question_type}</Badge>
      ),
    },
    {
      key: "points",
      label: "Poin",
      render: (item: Question) => (
        <span className="font-medium">{item.points}</span>
      ),
    },
    {
      key: "correct_answer",
      label: "Jawaban",
      render: (item: Question) => <Badge>{item.correct_answer}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: Question) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedQuestion(item);
              setEditDialogOpen(true);
            }}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedQuestion(item);
              setDeleteDialogOpen(true);
            }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (!packageId) {
    return (
      <EmptyState
        icon={Plus}
        title="Pilih Paket Tryout"
        description="Silakan pilih paket tryout dari menu Kelola Tryout untuk mengelola soal"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Soal</h1>
          <p className="text-muted-foreground mt-1">
            Manage soal untuk paket tryout
          </p>
        </div>
        <Button onClick={() => navigate(`/admin/tambah-soal/${packageId}`)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Soal
        </Button>
      </div>

      <DataTable
        data={questions}
        columns={columns}
        searchable
        searchPlaceholder="Cari soal..."
        loading={loading}
        emptyMessage="Belum ada soal"
      />

      <EditQuestionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        questionId={selectedQuestion?.id || null}
        onSuccess={loadQuestions}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Soal"
        description={`Apakah Anda yakin ingin menghapus soal nomor ${selectedQuestion?.question_number}?`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
