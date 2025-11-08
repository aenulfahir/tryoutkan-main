import { Clock, Users, Target, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PracticePackage } from "@/types/practice";
import { formatTime, getDifficultyColor, getCategoryLabel } from "@/services/practice";

interface PracticeCardProps {
  package: PracticePackage;
  onStart: () => void;
  onViewDetails: () => void;
}

export function PracticeCard({ package: pkg, onStart, onViewDetails }: PracticeCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {pkg.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {pkg.description || "Latihan soal untuk meningkatkan kemampuan Anda"}
            </CardDescription>
          </div>
          {pkg.thumbnail_url && (
            <div className="ml-3 flex-shrink-0">
              <img
                src={pkg.thumbnail_url}
                alt={pkg.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {getCategoryLabel(pkg.category)}
          </Badge>
          <Badge className={`text-xs ${getDifficultyColor(pkg.difficulty)}`}>
            {pkg.difficulty === "easy" && "Mudah"}
            {pkg.difficulty === "medium" && "Sedang"}
            {pkg.difficulty === "hard" && "Sulit"}
          </Badge>
          {pkg.is_free && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
              Gratis
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Timer Info */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            <span>{formatTime(pkg.default_time_per_question)} per soal</span>
          </div>

          {/* Question Count */}
          <div className="flex items-center text-sm text-gray-600">
            <Target className="h-4 w-4 mr-2 text-green-500" />
            <span>{pkg.total_questions} soal</span>
          </div>

          {/* Estimated Total Time */}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-purple-500" />
            <span>
              Estimasi {formatTime(pkg.default_time_per_question * pkg.total_questions)} total
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Detail
          </Button>
          <Button
            onClick={onStart}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-1" />
            Mulai
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}