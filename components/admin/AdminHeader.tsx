import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronRight,
  Check,
  X,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  getUnreadNotificationCount,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/admin";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadUnreadCount();
    loadNotifications();
  }, []);

  async function loadUserProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }

  async function loadUnreadCount() {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }

  async function loadNotifications() {
    try {
      setIsLoadingNotifications(true);
      const data = await getNotifications(10);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const count = await markAllNotificationsAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      // Update unread count
      setUnreadCount(0);
      toast.success(`${count} notifikasi ditandai sebagai telah dibaca`);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  function formatTime(dateString: string) {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } catch (error) {
      return "Baru saja";
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "purchase":
        return <ShoppingBag className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      toast.success("Logout Berhasil", {
        description: "Anda telah keluar dari admin dashboard.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Gagal Logout", {
        description: "Terjadi kesalahan saat logout.",
      });
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement global search
      console.log("Search:", searchQuery);
    }
  }

  // Generate breadcrumbs from current path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, path };
  });

  const getInitials = (name: string) => {
    if (!name) return "A";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-card border-b border-border z-30 transition-all duration-300">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center space-x-2">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <Link
                  to={crumb.path}
                  className={
                    index === breadcrumbs.length - 1
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </form>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 max-h-96 overflow-y-auto"
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifikasi</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-auto p-1"
                  >
                    Tandai semua dibaca
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoadingNotifications ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Memuat notifikasi...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Tidak ada notifikasi baru
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.is_read ? "bg-muted/30" : ""
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.data &&
                            notification.type === "purchase" && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <div>
                                  Paket: {notification.data.package_title}
                                </div>
                                <div>
                                  Harga: Rp{" "}
                                  {notification.data.purchase_price?.toLocaleString(
                                    "id-ID"
                                  ) || 0}
                                </div>
                              </div>
                            )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-center justify-center"
                    onClick={() => {
                      // Navigate to notifications page if exists
                      navigate("/admin/notifications");
                    }}
                  >
                    Lihat semua notifikasi
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userProfile?.avatar_url} />
                  <AvatarFallback>
                    {getInitials(userProfile?.name || "Admin")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block font-medium">
                  {userProfile?.name || "Admin"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{userProfile?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
