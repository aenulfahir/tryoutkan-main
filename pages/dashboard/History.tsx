import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimelineItem } from "@/components/TimelineItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Loader2, FileText, Filter } from "lucide-react";

interface TryoutSession {
  id: string;
  created_at: string;
  completed_at: string | null;
  time_spent_minutes: number | null;
  tryout_packages: {
    id: string;
    title: string;
    category: string;
  } | null;
  tryout_results: Array<{
    id: string;
    total_score: number;
    percentage: number;
  }> | null;
}

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TryoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Minimal analytics - using useMemo to recalculate when sessions change
  const totalCompleted = useMemo(() => {
    const completed = sessions.filter((s) => s.completed_at).length;
    console.log(
      "📊 Total Completed:",
      completed,
      "from",
      sessions.length,
      "sessions"
    );
    return completed;
  }, [sessions]);

  const totalHours = useMemo(() => {
    const hours =
      sessions.reduce((sum, s) => sum + (s.time_spent_minutes || 0), 0) / 60;
    console.log("⏱ Total Hours:", hours.toFixed(1), "h");
    return hours;
  }, [sessions]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      console.log("📜 Loading history for user:", user.id);

      // Load all tryout sessions (completed and in-progress)
      const { data: sessionsData, error } = await supabase
        .from("user_tryout_sessions")
        .select(
          `
          id,
          created_at,
          completed_at,
          time_spent_minutes,
          tryout_packages (
            id,
            title,
            category
          ),
          tryout_results (
            id,
            total_score,
            percentage
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error loading history:", error);
        throw error;
      }

      console.log("✅ Sessions loaded:", sessionsData?.length || 0);
      console.log("📊 Sessions data:", sessionsData);

      setSessions((sessionsData as unknown as TryoutSession[]) || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return !!session.completed_at;
    if (statusFilter === "in_progress") return !session.completed_at;
    return true;
  });

  const handleSessionClick = (session: TryoutSession) => {
    if (session.completed_at) {
      // Navigate to result detail
      navigate(`/dashboard/results/${session.id}`);
    } else {
      // Navigate to resume tryout
      navigate(`/dashboard/tryout/${session.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen text-black">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">Riwayat Aktivitas</h1>
        <p className="text-gray-600 font-medium mt-2">
          Timeline semua aktivitas tryout Anda
        </p>
      </div>

      {/* Minimal Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-black text-white rounded-lg border-2 border-black">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">Tryout Selesai</p>
                <p className="text-2xl font-black">{totalCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white text-black rounded-lg border-2 border-black">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">
                  Total Waktu Belajar
                </p>
                <p className="text-2xl font-black">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-bold">Filter:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] border-2 border-black font-bold focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-2 border-black">
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="in_progress">Belum Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="border-b-2 border-gray-100">
          <CardTitle className="font-black text-xl">Timeline Aktivitas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium mb-4">
                {statusFilter === "all"
                  ? "Belum ada riwayat tryout"
                  : statusFilter === "completed"
                    ? "Belum ada tryout yang selesai"
                    : "Tidak ada tryout yang sedang berjalan"}
              </p>
              <Button
                onClick={() => navigate("/dashboard/tryout")}
                className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
              >
                Mulai Tryout Pertama
              </Button>
            </div>
          ) : (
            <div className="relative space-y-6 pl-2">
              {filteredSessions.map((session, index) => {
                const isCompleted = !!session.completed_at;
                const result = session.tryout_results?.[0];

                return (
                  <TimelineItem
                    key={session.id}
                    title={session.tryout_packages?.title || "Tryout"}
                    category={session.tryout_packages?.category || "CPNS"}
                    date={session.created_at}
                    status={isCompleted ? "completed" : "in_progress"}
                    score={result?.total_score}
                    percentage={result?.percentage}
                    duration={session.time_spent_minutes || undefined}
                    progress={isCompleted ? 100 : 50}
                    onClick={() => handleSessionClick(session)}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
