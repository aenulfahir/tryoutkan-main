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
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Award className="w-6 h-6 text-amber-600" />;
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Ranking Tryout</h1>
          <p className="text-gray-600 mt-2">
            Lihat posisi Anda di antara peserta lainnya
          </p>
        </div>

        {/* Tryout Selector */}
        <Card className="mb-8 border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Pilih Tryout:</label>
              <Select value={selectedTryout} onValueChange={setSelectedTryout}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Pilih tryout" />
                </SelectTrigger>
                <SelectContent>
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
          <Card className="mb-8 border-2 border-black">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Posisi Anda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white font-bold text-lg">
                    #{userRank.rank_position}
                  </div>
                  <div>
                    <p className="font-semibold">Anda</p>
                    <p className="text-sm text-gray-600">
                      Skor: {userRank.score.toFixed(0)}
                    </p>
                  </div>
                </div>
                {userRank.percentile && (
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Top {(100 - userRank.percentile).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <Card className="mt-8">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Medal className="w-16 h-16 text-gray-400" />
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {getInitials(rankings[1]?.user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold truncate">
                  {rankings[1]?.user?.name || "Peserta"}
                </p>
                <p className="text-2xl font-bold text-gray-600 mt-2">
                  {rankings[1]?.score?.toFixed(0) || "0"}
                </p>
                <Badge className="mt-2 bg-gray-100 text-gray-800">#2</Badge>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className="border-2 border-yellow-500 bg-yellow-50">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Trophy className="w-16 h-16 text-yellow-500" />
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-yellow-500">
                  <AvatarFallback className="bg-yellow-200 text-yellow-800">
                    {getInitials(rankings[0]?.user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold text-lg truncate">
                  {rankings[0]?.user?.name || "Juara"}
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {rankings[0]?.score?.toFixed(0) || "0"}
                </p>
                <Badge className="mt-2 bg-yellow-500 text-white">
                  #1 Juara
                </Badge>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className="mt-8">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Award className="w-16 h-16 text-amber-600" />
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="bg-amber-200 text-amber-800">
                    {getInitials(rankings[2]?.user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold truncate">
                  {rankings[2]?.user?.name || "Peserta"}
                </p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {rankings[2]?.score?.toFixed(0) || "0"}
                </p>
                <Badge className="mt-2 bg-amber-100 text-amber-800">#3</Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Rankings Table */}
        <Card>
          <CardHeader className="bg-black text-white">
            <CardTitle>Daftar Lengkap</CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  Belum ada data ranking untuk tryout ini
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {rankings.map((rank) => {
                  const isCurrentUser = rank.user_id === userId;

                  return (
                    <div
                      key={rank.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-colors",
                        isCurrentUser && "bg-gray-100 border-black",
                        !isCurrentUser && "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(rank.rank_position) || (
                            <span className="text-lg font-bold">
                              #{rank.rank_position}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar>
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {getInitials(rank.user?.name || "")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        <div className="flex-1">
                          <p
                            className={cn(
                              "font-semibold",
                              isCurrentUser && "text-black"
                            )}
                          >
                            {isCurrentUser
                              ? "Anda"
                              : rank.user?.name || "Peserta"}
                          </p>
                          {rank.percentile && (
                            <p className="text-xs text-gray-600">
                              Top {(100 - rank.percentile).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {rank.score?.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-600">poin</p>
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
