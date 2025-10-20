import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  FileText,
  Award,
  Eye,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import type { TryoutPackage } from "@/types/tryout";
import { CATEGORY_INFO, DIFFICULTY_INFO } from "@/types/tryout";

interface TryoutCardProps {
  tryout: TryoutPackage;
  isPurchased: boolean;
  onViewDetail: () => void;
  onPurchase?: () => void;
  purchaseLoading?: boolean;
}

export function TryoutCard({
  tryout,
  isPurchased,
  onViewDetail,
  onPurchase,
  purchaseLoading = false,
}: TryoutCardProps) {
  const categoryInfo = CATEGORY_INFO[tryout.category];
  const difficultyInfo = DIFFICULTY_INFO[tryout.difficulty];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="space-y-3">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-sm">
            {categoryInfo.icon} {categoryInfo.name}
          </Badge>
          <Badge
            variant={difficultyInfo.color === "green" ? "default" : "secondary"}
            className={
              difficultyInfo.color === "yellow"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : difficultyInfo.color === "red"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : ""
            }
          >
            {difficultyInfo.label}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold line-clamp-2">{tryout.title}</h3>

        {/* Description */}
        {tryout.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tryout.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{tryout.duration_minutes} menit</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>{tryout.total_questions} soal</span>
          </div>
          {tryout.passing_grade && (
            <div className="flex items-center space-x-2 text-sm col-span-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span>Passing Grade: {tryout.passing_grade}%</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-2 border-t">
          {tryout.is_free ? (
            <p className="text-2xl font-bold text-green-600">GRATIS</p>
          ) : (
            <p className="text-2xl font-bold">{formatPrice(tryout.price)}</p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full space-y-2">
          {isPurchased && (
            <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Sudah Dibeli</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onViewDetail}
              className="flex-1"
              size="lg"
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Lihat Detail
            </Button>

            {!isPurchased && onPurchase && (
              <Button
                onClick={onPurchase}
                className="flex-1"
                size="lg"
                disabled={purchaseLoading}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {purchaseLoading ? "Memproses..." : "Beli Paket"}
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
