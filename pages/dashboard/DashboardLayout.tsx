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

  const isActive = (href: string) => {
    // Check if the current path starts with the href (for nested routes)
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const groupedNavItems = navItems.reduce((acc, item) => {
    const section = item.section || "OTHER";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Logo + Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 hover:bg-accent rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  T
                </span>
              </div>
              <span className="text-xl font-bold hidden sm:block">
                TryoutKan
              </span>
            </Link>
          </div>

          {/* Right: User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage src={userProfile?.avatar_url} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {getInitials(
                      userProfile?.name ||
                        user?.user_metadata?.name ||
                        user?.email ||
                        "User"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {userProfile?.name || user?.user_metadata?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={userProfile?.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(
                        userProfile?.name ||
                          user?.user_metadata?.name ||
                          user?.email ||
                          "User"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {userProfile?.name || user?.user_metadata?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground font-normal">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/support" className="cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col fixed left-0 top-16 bottom-0">
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <div key={section} className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                  {section}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                          ${
                            active
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {isMobileMenuOpen && (
          <aside className="lg:hidden fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-card z-40 flex flex-col">
            <nav className="flex-1 overflow-y-auto p-4">
              {Object.entries(groupedNavItems).map(([section, items]) => (
                <div key={section} className="mb-6">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                    {section}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                            ${
                              active
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        )}

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
