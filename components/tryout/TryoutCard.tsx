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
    <Card className="group hover:shadow-xl transition-all duration-300 flex flex-col h-full border-gray-200 hover:border-black overflow-hidden">
      {/* Card Header with gradient accent */}
      <div className="h-2 bg-gradient-to-r from-gray-900 to-black"></div>

      <CardHeader className="space-y-4 pb-4">
        {/* Category and Difficulty Badges */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            {categoryInfo.icon} {categoryInfo.name}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs font-medium ${
              difficultyInfo.color === "yellow"
                ? "border-yellow-400 text-yellow-700 bg-yellow-50"
                : difficultyInfo.color === "red"
                ? "border-red-400 text-red-700 bg-red-50"
                : "border-green-400 text-green-700 bg-green-50"
            }`}
          >
            {difficultyInfo.label}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
          {tryout.title}
        </h3>

        {/* Description */}
        {tryout.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {tryout.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
            <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Durasi</p>
              <p className="text-sm font-semibold text-gray-900">
                {tryout.duration_minutes} menit
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Soal</p>
              <p className="text-sm font-semibold text-gray-900">
                {tryout.total_questions} soal
              </p>
            </div>
          </div>
          {tryout.passing_grade && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors col-span-2">
              <Award className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Passing Grade</p>
                <p className="text-sm font-semibold text-gray-900">
                  {tryout.passing_grade}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Harga</span>
            {tryout.is_free ? (
              <p className="text-2xl font-bold text-green-600">GRATIS</p>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(tryout.price)}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-100">
        <div className="w-full space-y-3">
          {isPurchased && (
            <div className="flex items-center justify-center space-x-2 text-sm text-green-700 bg-green-50 py-3 px-4 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Sudah Dibeli</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onViewDetail}
              className="flex-1 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-200 font-medium"
              size="lg"
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Lihat Detail
            </Button>

            {!isPurchased && onPurchase && (
              <Button
                onClick={onPurchase}
                className="flex-1 bg-black text-white hover:bg-gray-800 transition-all duration-200 font-medium"
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
