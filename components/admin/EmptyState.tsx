import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
      <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(100,100,100,1)]">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-black mb-2 tracking-tight">{title}</h3>
      <p className="text-gray-600 font-medium mb-6 max-w-md">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
