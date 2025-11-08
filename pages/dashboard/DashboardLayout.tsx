import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  BookOpen,
  BarChart3,
  Trophy,
  History,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  section?: string;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "MENU UTAMA",
  },
  {
    name: "Tryout",
    href: "/dashboard/tryout",
    icon: BookOpen,
    section: "MENU UTAMA",
  },
  {
    name: "Latihan Soal",
    href: "/dashboard/practice",
    icon: Target,
    section: "MENU UTAMA",
  },
  {
    name: "Hasil & Analisis",
    href: "/dashboard/results",
    icon: BarChart3,
    section: "MENU UTAMA",
  },
  {
    name: "Ranking",
    href: "/dashboard/ranking",
    icon: Trophy,
    section: "MENU UTAMA",
  },
  // TEMPORARY: History menu hidden for development
  // {
  //   name: "Riwayat",
  //   href: "/dashboard/history",
  //   icon: History,
  //   section: "MENU UTAMA",
  // },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    section: "AKUN",
  },
  {
    name: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
    section: "AKUN",
  },
  {
    name: "Bantuan",
    href: "/dashboard/support",
    icon: HelpCircle,
    section: "AKUN",
  },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  async function loadUserProfile() {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setUserProfile(data);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Group nav items by section
  const groupedNavItems = navItems.reduce((acc, item) => {
    const section = item.section || "OTHER";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">TryoutKan</h1>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-6">
              {Object.entries(groupedNavItems).map(([section, items]) => (
                <div key={section} className="space-y-2">
                  <h3 className="px-3 text-xs font-semibold text-sidebar-accent-foreground uppercase tracking-wider">
                    {section}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <item.icon
                            className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                              isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 flex z-40">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-sidebar border-r border-sidebar-border">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-white/10 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-sidebar-border">
              <h1 className="text-xl font-bold text-sidebar-foreground">TryoutKan</h1>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-4 py-6 space-y-6">
                {Object.entries(groupedNavItems).map(([section, items]) => (
                  <div key={section} className="space-y-2">
                    <h3 className="px-3 text-xs font-semibold text-sidebar-accent-foreground uppercase tracking-wider">
                      {section}
                    </h3>
                    <div className="space-y-1">
                      {items.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                              isActive
                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }`}
                          >
                            <item.icon
                              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                                isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
          <button
            type="button"
            className="md:hidden px-4 border-r border-border text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 sm:px-6 flex justify-between">
            <div className="flex-1 flex items-center">
              {/* Page title */}
              <h1 className="text-lg font-semibold text-foreground">
                {navItems.find(item => item.href === location.pathname)?.name || "Dashboard"}
              </h1>
            </div>

            {/* User menu */}
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-primary transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.name || user?.email} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {userProfile?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.name || "Pengguna"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/settings")}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    Pengaturan
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/billing")}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/support")}
                    className="cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    Bantuan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-background">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}