import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Gift } from "lucide-react";
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
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { ViewUserDialog } from "@/components/admin/ViewUserDialog";
import { GiftCreditDialog } from "@/components/admin/GiftCreditDialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: string;
  created_at: string;
}

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [roleFilter, users]);

  async function loadUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }

  function filterUsers() {
    if (roleFilter === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((u) => u.role === roleFilter));
    }
  }

  function handleSearch(query: string) {
    if (!query.trim()) {
      filterUsers();
      return;
    }

    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  }

  async function handleDelete() {
    if (!selectedUser) return;

    try {
      setDeleting(true);

      // Delete auth user (will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);

      if (error) throw error;

      toast.success("User berhasil dihapus");
      loadUsers();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Gagal menghapus user");
    } finally {
      setDeleting(false);
    }
  }

  function handleView(userId: string) {
    setSelectedUserId(userId);
    setViewDialogOpen(true);
  }

  function handleEdit(userId: string) {
    setSelectedUserId(userId);
    setEditDialogOpen(true);
  }

  function handleGift(userId: string, userName: string) {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setGiftDialogOpen(true);
  }

  const columns = [
    {
      key: "user",
      label: "User",
      render: (item: User) => (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={item.avatar_url} />
            <AvatarFallback>
              {item.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "role",
      label: "Role",
      render: (item: User) => (
        <Badge variant={item.role === "admin" ? "default" : "secondary"}>
          {item.role}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Registered",
      render: (item: User) => (
        <span className="text-sm">
          {new Date(item.created_at).toLocaleDateString("id-ID")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: User) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            title="View"
            onClick={() => handleView(item.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Edit"
            onClick={() => handleEdit(item.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Gift Credit"
            onClick={() => handleGift(item.id, item.name)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20"
          >
            <Gift className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedUser(item);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Akun</h1>
          <p className="text-muted-foreground mt-1">
            User management dan role assignment
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah User
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        searchable
        searchPlaceholder="Cari user..."
        onSearch={handleSearch}
        loading={loading}
        emptyMessage="Belum ada user"
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus User"
        description={`Apakah Anda yakin ingin menghapus user "${selectedUser?.name}"? Semua data terkait akan ikut terhapus.`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleting}
      />

      {/* Add User Dialog */}
      <AddUserDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={loadUsers}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userId={selectedUserId}
        onSuccess={loadUsers}
      />

      {/* View User Dialog */}
      <ViewUserDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        userId={selectedUserId}
      />

      {/* Gift Credit Dialog */}
      <GiftCreditDialog
        open={giftDialogOpen}
        onOpenChange={setGiftDialogOpen}
        userId={selectedUserId}
        userName={selectedUserName}
        onSuccess={loadUsers}
      />
    </div>
  );
}
