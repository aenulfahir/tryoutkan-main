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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Riwayat Aktivitas</h1>
        <p className="text-muted-foreground mt-2">
          Timeline semua aktivitas tryout Anda
        </p>
      </div>

      {/* Minimal Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tryout Selesai</p>
                <p className="text-2xl font-bold">{totalCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Waktu Belajar
                </p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="in_progress">Belum Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all"
                  ? "Belum ada riwayat tryout"
                  : statusFilter === "completed"
                  ? "Belum ada tryout yang selesai"
                  : "Tidak ada tryout yang sedang berjalan"}
              </p>
              <Button onClick={() => navigate("/dashboard/tryout")}>
                Mulai Tryout Pertama
              </Button>
            </div>
          ) : (
            <div className="relative">
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
