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
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
  }, [categoryFilter, statusFilter, tryouts]);

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
    let filtered = tryouts;

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) =>
        statusFilter === "active" ? t.is_active : !t.is_active
      );
    }

    setFilteredTryouts(filtered);
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
        <Avatar className="w-12 h-12 rounded-md border-2 border-black">
          <AvatarImage src={item.thumbnail_url || ""} />
          <AvatarFallback className="rounded-md bg-black text-white font-bold">
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
          <p className="font-bold text-black">{item.title}</p>
          <p className="text-sm text-gray-600 font-medium line-clamp-1">
            {item.description}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Kategori",
      render: (item: TryoutPackage) => (
        <Badge variant="outline" className="border-2 border-black font-bold">
          {item.category}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Harga",
      render: (item: TryoutPackage) => (
        <div>
          {item.is_free ? (
            <Badge variant="secondary" className="bg-gray-100 text-black border-2 border-black font-bold">
              Gratis
            </Badge>
          ) : (
            <span className="font-black text-black">
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
        <span className="font-medium text-gray-700">{item.total_questions}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (item: TryoutPackage) => (
        <Badge
          variant={item.is_active ? "default" : "secondary"}
          className={`font-bold border-2 border-black ${item.is_active
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-white text-black hover:bg-gray-100"
            }`}
        >
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
            className="hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
          >
            <FileQuestion className="w-4 h-4 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedTryout(item);
              setFormOpen(true);
            }}
            title="Edit"
            className="hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
          >
            <Edit className="w-4 h-4 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedTryout(item);
              setDeleteDialogOpen(true);
            }}
            title="Delete"
            className="hover:bg-red-50 border-2 border-transparent hover:border-red-600 transition-all group"
          >
            <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-white min-h-screen text-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Kelola Tryout</h1>
          <p className="text-gray-600 font-medium mt-1">
            Manage tryout packages dan soal
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedTryout(null);
            setFormOpen(true);
          }}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tryout
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 border-2 border-black font-bold focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <SelectValue placeholder="Filter Kategori" />
          </SelectTrigger>
          <SelectContent className="border-2 border-black font-medium">
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 border-2 border-black font-bold focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent className="border-2 border-black font-medium">
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">✅ Active</SelectItem>
            <SelectItem value="inactive">❌ Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border-2 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DataTable
          data={filteredTryouts}
          columns={columns}
          searchable
          searchPlaceholder="Cari tryout..."
          onSearch={handleSearch}
          loading={loading}
          emptyMessage="Belum ada tryout"
        />
      </div>

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
