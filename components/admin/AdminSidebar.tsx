import { useState } from "react";
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
  Target,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export default function AdminSidebar({
  open,
  onToggle,
  mobile = false,
}: AdminSidebarProps) {
  const location = useLocation();
  const [practiceSubmenuOpen, setPracticeSubmenuOpen] = useState(false);

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
  ];

  const practiceSubmenuItems = [
    {
      title: "Paket Latihan",
      href: "/admin/practice",
    },
    {
      title: "Soal Latihan",
      href: "/admin/practice-questions",
    },
  ];

  const otherMenuItems = [
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

  const isPracticeSubmenuActive = practiceSubmenuItems.some(item =>
    location.pathname === item.href
  );

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out z-40",
        mobile
          ? open
            ? "translate-x-0 w-64"
            : "-translate-x-full w-64"
          : open
          ? "w-64"
          : "w-20"
      )}
    >
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {open && (
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">
                T
              </span>
            </div>
            <span className="text-xl font-bold">Admin</span>
          </Link>
        )}

        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(!open && "mx-auto")}
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
      <nav className="p-4 space-y-2">
        {/* Regular Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground",
                !open && "justify-center"
              )}
              title={!open ? item.title : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {open && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}

        {/* Practice Submenu */}
        {open ? (
          <Collapsible
            open={practiceSubmenuOpen}
            onOpenChange={setPracticeSubmenuOpen}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 py-2.5 rounded-lg transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isPracticeSubmenuActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground"
                )}
              >
                <Target className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">Kelola Latihan Soal</span>
                <ChevronDown
                  className={cn(
                    "ml-auto h-4 w-4 transition-transform",
                    practiceSubmenuOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {practiceSubmenuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 pl-12 pr-3 py-2 rounded-lg transition-colors text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground"
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Link
            to="/admin/practice"
            className={cn(
              "flex items-center justify-center px-3 py-2.5 rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isPracticeSubmenuActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground"
            )}
            title="Kelola Latihan Soal"
          >
            <Target className="w-5 h-5 flex-shrink-0" />
          </Link>
        )}

        {/* Other Menu Items */}
        {otherMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground",
                !open && "justify-center"
              )}
              title={!open ? item.title : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {open && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            <p>TryoutKan Admin</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  );
}