import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, FileQuestion, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import TryoutFormWithSections from "@/components/admin/TryoutFormWithSections";
import { toast } from "sonner";
import type { TryoutPackage } from "@/types/tryout";
import {
  getTryoutPackages,
  createTryoutPackage,
  updateTryoutPackage,
  deleteTryoutPackage,
  uploadThumbnail,
} from "@/services/admin";

export default function AdminTryoutList() {
  const navigate = useNavigate();
  const [tryouts, setTryouts] = useState<TryoutPackage[]>([]);
  const [filteredTryouts, setFilteredTryouts] = useState<TryoutPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState<TryoutPackage | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTryouts();
  }, []);

  useEffect(() => {
    filterTryouts();
  }, [categoryFilter, tryouts]);

  async function loadTryouts() {
    try {
      setLoading(true);
      const data = await getTryoutPackages();
      setTryouts(data || []);
    } catch (error) {
      console.error("Error loading tryouts:", error);
      toast.error("Gagal memuat data tryout");
    } finally {
      setLoading(false);
    }
  }

  function filterTryouts() {
    if (categoryFilter === "all") {
      setFilteredTryouts(tryouts);
    } else {
      setFilteredTryouts(tryouts.filter((t) => t.category === categoryFilter));
    }
  }

  function handleSearch(query: string) {
    if (!query.trim()) {
      filterTryouts();
      return;
    }

    const filtered = tryouts.filter((t) =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTryouts(filtered);
  }

  async function handleDelete() {
    if (!selectedTryout) return;

    try {
      setDeleting(true);
      await deleteTryoutPackage(selectedTryout.id);
      toast.success("Tryout berhasil dihapus");
      loadTryouts();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting tryout:", error);
      toast.error("Gagal menghapus tryout");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmit(data: any, thumbnail?: File) {
    try {
      let thumbnailUrl = selectedTryout?.thumbnail_url || "";

      // Upload thumbnail if provided
      if (thumbnail) {
        thumbnailUrl = await uploadThumbnail(thumbnail);
      }

      const packageData = {
        ...data,
        thumbnail_url: thumbnailUrl,
      };

      if (selectedTryout) {
        // Update
        await updateTryoutPackage(selectedTryout.id, packageData);
        toast.success("Tryout berhasil diupdate");
      } else {
        // Create
        await createTryoutPackage(packageData);
        toast.success("Tryout berhasil dibuat");
      }

      loadTryouts();
      setFormOpen(false);
      setSelectedTryout(null);
    } catch (error) {
      console.error("Error submitting tryout:", error);
      toast.error("Gagal menyimpan tryout");
      throw error;
    }
  }

  const columns = [
    {
      key: "thumbnail",
      label: "Thumbnail",
      render: (item: TryoutPackage) => (
        <Avatar className="w-12 h-12 rounded-md">
          <AvatarImage src={item.thumbnail_url || ""} />
          <AvatarFallback className="rounded-md">
            {item.title.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "title",
      label: "Judul",
      render: (item: TryoutPackage) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {item.description}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Kategori",
      render: (item: TryoutPackage) => (
        <Badge variant="outline">{item.category}</Badge>
      ),
    },
    {
      key: "price",
      label: "Harga",
      render: (item: TryoutPackage) => (
        <div>
          {item.is_free ? (
            <Badge variant="secondary">Gratis</Badge>
          ) : (
            <span className="font-medium">
              Rp {item.price.toLocaleString("id-ID")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "total_questions",
      label: "Total Soal",
      render: (item: TryoutPackage) => (
        <span className="font-medium">{item.total_questions}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (item: TryoutPackage) => (
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: TryoutPackage) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/questions?package=${item.id}`)}
            title="Kelola Soal"
          >
            <FileQuestion className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedTryout(item);
              setFormOpen(true);
            }}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedTryout(item);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Tryout</h1>
          <p className="text-muted-foreground mt-1">
            Manage tryout packages dan soal
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedTryout(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tryout
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="CPNS">🏛️ CPNS</SelectItem>
            <SelectItem value="BUMN_TKD">🏢 BUMN TKD</SelectItem>
            <SelectItem value="BUMN_AKHLAK">⭐ BUMN AKHLAK</SelectItem>
            <SelectItem value="BUMN_TBI">🌐 BUMN TBI</SelectItem>
            <SelectItem value="STAN">🎓 STAN</SelectItem>
            <SelectItem value="PLN">⚡ PLN</SelectItem>
            <SelectItem value="OTHER">📝 Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredTryouts}
        columns={columns}
        searchable
        searchPlaceholder="Cari tryout..."
        onSearch={handleSearch}
        loading={loading}
        emptyMessage="Belum ada tryout"
      />

      {/* Tryout Form */}
      <TryoutFormWithSections
        open={formOpen}
        onOpenChange={setFormOpen}
        tryout={selectedTryout}
        onSuccess={() => {
          loadTryouts();
          setFormOpen(false);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Tryout"
        description={`Apakah Anda yakin ingin menghapus "${selectedTryout?.title}"? Semua soal dan data terkait akan ikut terhapus.`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
