import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Phone, Calendar, ShoppingCart, FileText } from "lucide-react";

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  purchaseCount: number;
  sessionCount: number;
  totalScore: number;
}

export function ViewUserDialog({
  open,
  onOpenChange,
  userId,
}: ViewUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    if (open && userId) {
      loadUserDetails();
    }
  }, [open, userId]);

  async function loadUserDetails() {
    try {
      setLoading(true);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Get purchase count
      const { count: purchaseCount } = await supabase
        .from("user_tryout_purchases")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get session count
      const { count: sessionCount } = await supabase
        .from("user_tryout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get total score from results
      const { data: results } = await supabase
        .from("tryout_results")
        .select("score")
        .eq("user_id", userId);

      const totalScore = results?.reduce((sum, r) => sum + (r.score || 0), 0) || 0;

      setUser({
        ...profile,
        purchaseCount: purchaseCount || 0,
        sessionCount: sessionCount || 0,
        totalScore,
      });
    } catch (error: any) {
      console.error("Error loading user details:", error);
      toast.error("Gagal memuat detail user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail User</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang user
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Bergabung: {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-muted-foreground">Pembelian</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user.purchaseCount}
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-muted-foreground">Tryout</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {user.sessionCount}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Total Skor</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {user.totalScore}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Informasi Tambahan</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>User ID: {user.id}</p>
                <p>
                  Akun dibuat: {new Date(user.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            User tidak ditemukan
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

