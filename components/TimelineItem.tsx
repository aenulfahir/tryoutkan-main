import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, PlayCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_INFO } from "@/types/tryout";

interface TimelineItemProps {
  title: string;
  category: string;
  date: string;
  status: "completed" | "in_progress";
  score?: number;
  percentage?: number;
  duration?: number;
  progress?: number;
  onClick: () => void;
}

export function TimelineItem({
  title,
  category,
  date,
  status,
  score,
  percentage,
  duration,
  progress,
  onClick,
}: TimelineItemProps) {
  const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
  const isCompleted = status === "completed";

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="relative flex gap-4 pb-8 group">
      {/* Timeline Line & Dot */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all",
            isCompleted
              ? "bg-green-100 dark:bg-green-950 border-2 border-green-500"
              : "bg-blue-100 dark:bg-blue-950 border-2 border-blue-500"
          )}
        >
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        {/* Vertical Line */}
        <div className="w-0.5 h-full bg-border absolute top-10" />
      </div>

      {/* Content Card */}
      <div
        className={cn(
          "flex-1 p-4 rounded-lg border bg-card transition-all cursor-pointer",
          "hover:shadow-md hover:border-primary/50"
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {categoryInfo && (
                <Badge variant="secondary" className="text-xs">
                  {categoryInfo.icon} {categoryInfo.name}
                </Badge>
              )}
              <Badge
                variant={isCompleted ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  isCompleted
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                )}
              >
                {isCompleted ? "Selesai" : "Belum Selesai"}
              </Badge>
            </div>
            <h3 className="font-semibold text-base line-clamp-1">{title}</h3>
          </div>

          {/* Score (if completed) */}
          {isCompleted && score !== undefined && percentage !== undefined && (
            <div className="text-right ml-4">
              <p className="text-2xl font-bold">{percentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                Skor: {score.toFixed(0)}
              </p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatRelativeTime(date)}</span>
          </div>
          {isCompleted && duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Durasi: {formatDuration(duration)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar (if in progress) */}
        {!isCompleted && progress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Eye className="w-3.5 h-3.5 mr-2" />
          {isCompleted ? "Lihat Detail" : "Lanjutkan Tryout"}
        </Button>
      </div>
    </div>
  );
}

