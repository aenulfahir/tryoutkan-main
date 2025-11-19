import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { TryoutPackage, Ranking } from "@/types/tryout";
import { getTryoutPackages, getRankings, getUserRank } from "@/services/tryout";

export default function RankingPage() {
  const [tryouts, setTryouts] = useState<TryoutPackage[]>([]);
  const [selectedTryout, setSelectedTryout] = useState<string>("");
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [userRank, setUserRank] = useState<Ranking | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadTryouts();
    // Get current user
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedTryout) {
      loadRankings();
    }
  }, [selectedTryout]);

  async function loadTryouts() {
    try {
      setLoading(true);
      const tryoutsData = await getTryoutPackages();
      setTryouts(tryoutsData);

      if (tryoutsData.length > 0) {
        setSelectedTryout(tryoutsData[0].id);
      }
    } catch (error) {
      console.error("Error loading tryouts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRankings() {
    try {
      setLoading(true);

      // Load rankings
      const rankingsData = await getRankings(selectedTryout, 100);
      setRankings(rankingsData);

      // Load user rank
      if (userId) {
        const userRankData = await getUserRank(userId, selectedTryout);
        setUserRank(userRankData);
      }
    } catch (error) {
      console.error("Error loading rankings:", error);
    } finally {
      setLoading(false);
    }
  }

  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-black" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-600" />;
    if (position === 3) return <Award className="w-6 h-6 text-gray-400" />;
    return null;
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading && tryouts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight">Ranking Tryout</h1>
          <p className="text-gray-600 mt-2 font-medium">
            Lihat posisi Anda di antara peserta lainnya
          </p>
        </div>

        {/* Tryout Selector */}
        <Card className="mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <label className="text-sm font-bold whitespace-nowrap">Pilih Tryout:</label>
              <Select value={selectedTryout} onValueChange={setSelectedTryout}>
                <SelectTrigger className="w-full max-w-md border-2 border-black font-bold focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Pilih tryout" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black">
                  {tryouts.map((tryout) => (
                    <SelectItem key={tryout.id} value={tryout.id}>
                      {tryout.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* User Rank Card */}
        {userRank && (
          <Card className="mb-8 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Posisi Anda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-black font-black text-lg border-2 border-white">
                    #{userRank.rank_position}
                  </div>
                  <div>
                    <p className="font-bold text-lg">Anda</p>
                    <p className="text-sm text-gray-300 font-medium">
                      Skor: {userRank.score.toFixed(0)}
                    </p>
                  </div>
                </div>
                {userRank.percentile && (
                  <Badge variant="secondary" className="text-lg px-4 py-2 bg-white text-black font-bold border-2 border-white">
                    Top {(100 - userRank.percentile).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
            {/* 2nd Place */}
            <Card className="mt-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] order-2 md:order-1">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Medal className="w-16 h-16 text-gray-400" />
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-black">
                  <AvatarFallback className="bg-gray-100 text-black font-bold">
                    {getInitials(rankings[1]?.user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold truncate text-lg">
                  {rankings[1]?.user?.name || "Peserta"}
                </p>
                <p className="text-2xl font-black text-gray-600 mt-2">
                  {rankings[1]?.score?.toFixed(0) || "0"}
                </p>
                <Badge className="mt-2 bg-gray-200 text-black border-2 border-black font-bold">#2</Badge>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className="border-2 border-black bg-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] order-1 md:order-2 transform md:-translate-y-4 z-10">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <Trophy className="w-20 h-20 text-white" />
                </div>
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white border-2 border-black">
                  <AvatarFallback className="bg-white text-black font-black text-xl">
                    {getInitials(rankings[0]?.user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-black text-xl truncate">
                  {rankings[0]?.user?.name || "Juara"}
                </p>
                <p className="text-4xl font-black text-white mt-2">
                  {rankings[0]?.score?.toFixed(0) || "0"}
                </p>
                <Badge className="mt-2 bg-white text-black border-2 border-white font-bold text-lg px-4 py-1">
                  #1 Juara
                </Badge>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className="mt-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] order-3">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Award className="w-16 h-16 text-gray-600" />
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-black">
                  <AvatarFallback className="bg-gray-50 text-black font-bold">
                    {getInitials(rankings[2]?.user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold truncate text-lg">
                  {rankings[2]?.user?.name || "Peserta"}
                </p>
                <p className="text-2xl font-black text-gray-600 mt-2">
                  {rankings[2]?.score?.toFixed(0) || "0"}
                </p>
                <Badge className="mt-2 bg-gray-100 text-black border-2 border-black font-bold">#3</Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Rankings Table */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-black text-white border-b-2 border-black">
            <CardTitle className="font-black">Daftar Lengkap</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rankings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 font-medium">
                  Belum ada data ranking untuk tryout ini
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-100">
                {rankings.map((rank) => {
                  const isCurrentUser = rank.user_id === userId;

                  return (
                    <div
                      key={rank.id}
                      className={cn(
                        "flex items-center justify-between p-4 transition-colors",
                        isCurrentUser ? "bg-gray-50" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(rank.rank_position) || (
                            <span className="text-lg font-black text-gray-400">
                              #{rank.rank_position}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="border-2 border-black">
                          <AvatarFallback className="bg-white text-black font-bold">
                            {getInitials(rank.user?.name || "")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        <div className="flex-1">
                          <p
                            className={cn(
                              "font-bold text-lg",
                              isCurrentUser ? "text-black" : "text-gray-800"
                            )}
                          >
                            {isCurrentUser
                              ? "Anda"
                              : rank.user?.name || "Peserta"}
                          </p>
                          {rank.percentile && (
                            <p className="text-xs text-gray-500 font-medium">
                              Top {(100 - rank.percentile).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-xl font-black text-black">
                          {rank.score?.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-500 font-bold">poin</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
