import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Loader2 } from "lucide-react";
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
  }, []);

  useEffect(() => {
    if (selectedTryout) {
      loadRankings();
    }
  }, [selectedTryout]);

  async function loadTryouts() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }

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
    if (position === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankBadgeColor = (position: number) => {
    if (position === 1)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (position === 2)
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    if (position === 3)
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    return "bg-muted text-muted-foreground";
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const maskName = (name: string) => {
    if (!name) return "User";
    if (name.length <= 3) return name;
    return `${name.substring(0, 3)}***`;
  };

  const getUserDisplayName = (user: any) => {
    if (!user) return "User";
    return user.name || user.email?.split("@")[0] || "User";
  };

  if (loading && tryouts.length === 0) {
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
        <h1 className="text-3xl font-bold">Ranking Nasional</h1>
        <p className="text-muted-foreground mt-2">
          Lihat posisi Anda di antara peserta lainnya
        </p>
      </div>

      {/* Tryout Selector */}
      <Card>
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
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Posisi Anda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  #{userRank.rank_position}
                </div>
                <div>
                  <p className="font-semibold">Anda</p>
                  <p className="text-sm text-muted-foreground">
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
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Medal className="w-12 h-12 text-gray-400" />
              </div>
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {getInitials(getUserDisplayName(rankings[1]?.user))}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold truncate">
                {maskName(getUserDisplayName(rankings[1]?.user))}
              </p>
              <p className="text-2xl font-bold text-gray-600 mt-2">
                {rankings[1]?.score.toFixed(0)}
              </p>
              <Badge className="mt-2 bg-gray-100 text-gray-800">#2</Badge>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>
              <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-yellow-500">
                <AvatarFallback className="bg-yellow-200 text-yellow-800">
                  {getInitials(getUserDisplayName(rankings[0]?.user))}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-lg truncate">
                {maskName(getUserDisplayName(rankings[0]?.user))}
              </p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {rankings[0]?.score.toFixed(0)}
              </p>
              <Badge className="mt-2 bg-yellow-500 text-white">
                #1 Champion
              </Badge>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Medal className="w-12 h-12 text-amber-600" />
              </div>
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarFallback className="bg-amber-200 text-amber-800">
                  {getInitials(getUserDisplayName(rankings[2]?.user))}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold truncate">
                {maskName(getUserDisplayName(rankings[2]?.user))}
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-2">
                {rankings[2]?.score.toFixed(0)}
              </p>
              <Badge className="mt-2 bg-amber-100 text-amber-800">#3</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Lengkap</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
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
                      isCurrentUser && "bg-primary/10 border-primary",
                      !isCurrentUser && "hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(rank.rank_position) || (
                          <span className="text-lg font-bold text-muted-foreground">
                            #{rank.rank_position}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(getUserDisplayName(rank.user))}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name */}
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-semibold",
                            isCurrentUser && "text-primary"
                          )}
                        >
                          {isCurrentUser
                            ? "Anda"
                            : maskName(getUserDisplayName(rank.user))}
                        </p>
                        {rank.percentile && (
                          <p className="text-xs text-muted-foreground">
                            Top {(100 - rank.percentile).toFixed(0)}%
                          </p>
                        )}
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {rank.score.toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">poin</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
