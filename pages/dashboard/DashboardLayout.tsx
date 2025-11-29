import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  BookOpen,
  BarChart3,
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    if (href === "/dashboard" && location.pathname !== "/dashboard") {
      return false;
    }
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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-black z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo + Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold hidden sm:block tracking-tight">
                TryoutKan
              </span>
            </Link>
          </div>

          {/* Right: User Profile Dropdown */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none"
                >
                  <Avatar className="w-9 h-9 border-2 border-black">
                    <AvatarImage src={userProfile?.avatar_url} />
                    <AvatarFallback className="bg-black text-white font-bold">
                      {getInitials(
                        userProfile?.name ||
                        user?.user_metadata?.name ||
                        user?.email ||
                        "User"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold leading-none">
                      {userProfile?.name || user?.user_metadata?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.email || ""}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <DropdownMenuLabel>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-black">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-black text-white font-bold">
                        {getInitials(
                          userProfile?.name ||
                          user?.user_metadata?.name ||
                          user?.email ||
                          "User"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">
                        {userProfile?.name || user?.user_metadata?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 font-normal">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 font-medium">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/support" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 font-medium">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 border-r-2 border-black bg-white flex-col fixed left-0 top-16 bottom-0 z-40">
          <nav className="flex-1 overflow-y-auto p-6 space-y-8">
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <div key={section}>
                <h3 className="text-xs font-black text-gray-400 mb-4 px-3 tracking-wider uppercase">
                  {section}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`
                          flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                          ${active
                            ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] translate-x-1"
                            : "text-gray-600 hover:bg-gray-100 hover:text-black"
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500 group-hover:text-black"}`} />
                        <span className="font-bold text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-16 bottom-0 w-64 border-r-2 border-black bg-white z-50 flex flex-col shadow-2xl"
              >
                <nav className="flex-1 overflow-y-auto p-6 space-y-8">
                  {Object.entries(groupedNavItems).map(([section, items]) => (
                    <div key={section}>
                      <h3 className="text-xs font-black text-gray-400 mb-4 px-3 tracking-wider uppercase">
                        {section}
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.href);

                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`
                                flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                ${active
                                  ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
                                }
                              `}
                            >
                              <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500"}`} />
                              <span className="font-bold text-sm">{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
