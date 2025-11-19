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
      <DialogContent className="sm:max-w-[600px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="font-black text-xl">Detail User</DialogTitle>
          <DialogDescription className="font-medium text-gray-600">
            Informasi lengkap tentang user
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">{user.name}</h3>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className={`font-bold border-2 border-black ${user.role === "admin" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  {user.role}
                </Badge>
              </div>

              <div className="space-y-2 text-sm font-medium">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-black" />
                  <span>{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-black" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-black" />
                  <span>
                    Bergabung: {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4 text-black" />
                  <span className="text-xs text-gray-600 font-bold">Pembelian</span>
                </div>
                <p className="text-2xl font-black text-black">
                  {user.purchaseCount}
                </p>
              </div>

              <div className="p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-black" />
                  <span className="text-xs text-gray-600 font-bold">Tryout</span>
                </div>
                <p className="text-2xl font-black text-black">
                  {user.sessionCount}
                </p>
              </div>

              <div className="p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-600 font-bold">Total Skor</span>
                </div>
                <p className="text-2xl font-black text-black">
                  {user.totalScore}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="p-4 bg-gray-50 border-2 border-black rounded-lg">
              <h4 className="font-bold mb-2">Informasi Tambahan</h4>
              <div className="space-y-1 text-sm text-gray-600 font-medium">
                <p>User ID: {user.id}</p>
                <p>
                  Akun dibuat: {new Date(user.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 font-medium py-8">
            User tidak ditemukan
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
