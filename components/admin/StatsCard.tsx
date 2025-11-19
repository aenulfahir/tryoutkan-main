import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  bgColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "text-black",
  bgColor = "bg-white",
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-2 border-black bg-gray-50">
        <CardTitle className="text-sm font-bold text-gray-600">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", bgColor)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-black text-black">{value}</div>
        {description && (
          <p className="text-xs font-medium text-gray-600 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span
              className={cn(
                "text-xs font-bold",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs font-medium text-gray-500 ml-2">
              vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
