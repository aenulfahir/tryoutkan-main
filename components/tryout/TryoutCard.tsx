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
    <Card className="group hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col h-full border-2 border-black overflow-hidden bg-white">
      <CardHeader className="space-y-4 pb-4">
        {/* Category and Difficulty Badges */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="text-xs font-bold bg-black text-white hover:bg-gray-800 transition-colors border-2 border-black"
          >
            {categoryInfo.icon} {categoryInfo.name}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-bold border-2 border-black text-black bg-transparent"
          >
            {difficultyInfo.label}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-black line-clamp-2 group-hover:underline decoration-2 underline-offset-4 transition-all">
          {tryout.title}
        </h3>

        {/* Description */}
        {tryout.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed font-medium">
            {tryout.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-2 border-transparent group-hover:border-black transition-all">
            <Clock className="w-5 h-5 text-black flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-bold uppercase">Durasi</p>
              <p className="text-sm font-bold text-black">
                {tryout.duration_minutes} menit
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-2 border-transparent group-hover:border-black transition-all">
            <FileText className="w-5 h-5 text-black flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-bold uppercase">Soal</p>
              <p className="text-sm font-bold text-black">
                {tryout.total_questions} soal
              </p>
            </div>
          </div>
          {tryout.passing_grade && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-2 border-transparent group-hover:border-black transition-all col-span-2">
              <Award className="w-5 h-5 text-black flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-bold uppercase">Passing Grade</p>
                <p className="text-sm font-bold text-black">
                  {tryout.passing_grade}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="pt-4 border-t-2 border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-600 uppercase">Harga</span>
            {tryout.is_free ? (
              <p className="text-2xl font-black text-black">GRATIS</p>
            ) : (
              <p className="text-2xl font-black text-black">
                {formatPrice(tryout.price)}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t-2 border-gray-100">
        <div className="w-full space-y-3">
          {isPurchased && (
            <div className="flex items-center justify-center space-x-2 text-sm text-black bg-gray-100 py-3 px-4 rounded-lg border-2 border-black font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Sudah Dibeli</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onViewDetail}
              className="flex-1 bg-white text-black border-2 border-black hover:bg-gray-100 transition-all duration-200 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
              size="lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Detail
            </Button>

            {!isPurchased && onPurchase && (
              <Button
                onClick={onPurchase}
                className="flex-1 bg-black text-white border-2 border-black hover:bg-gray-800 transition-all duration-200 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
                size="lg"
                disabled={purchaseLoading}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {purchaseLoading ? "..." : "Beli"}
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
