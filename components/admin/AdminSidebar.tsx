import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Trophy,
  DollarSign,
  Users,
  Settings,
  Gift,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Kelola Tryout",
    icon: BookOpen,
    href: "/admin/tryouts",
  },
  {
    title: "Kelola Soal",
    icon: FileQuestion,
    href: "/admin/questions",
  },
  {
    title: "Ranking",
    icon: Trophy,
    href: "/admin/ranking",
  },
  {
    title: "Pendapatan",
    icon: DollarSign,
    href: "/admin/revenue",
  },
  {
    title: "Kode Promo",
    icon: Gift,
    href: "/admin/promo-codes",
  },
  {
    title: "Notifikasi",
    icon: Bell,
    href: "/admin/notifications",
  },
  {
    title: "Kelola Akun",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Pengaturan",
    icon: Settings,
    href: "/admin/settings",
  },
];

export default function AdminSidebar({
  open,
  onToggle,
  mobile = false,
}: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-white border-r-2 border-black transition-all duration-300 ease-in-out z-40",
        mobile
          ? open
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full w-64"
          : open
            ? "w-64"
            : "w-20"
      )}
    >
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b-2 border-black">
        {open && (
          <Link to="/admin/dashboard" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Admin</span>
          </Link>
        )}

        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "hover:bg-gray-100 text-black",
              !open && "mx-auto"
            )}
          >
            {open ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] translate-x-1"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black",
                !open && "justify-center px-2"
              )}
              title={!open ? item.title : undefined}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-gray-500 group-hover:text-black")} />
              {open && <span className="font-bold text-sm">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-black bg-gray-50">
          <div className="text-xs text-gray-500 text-center font-medium">
            <p>TryoutKan Admin</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  );
}
