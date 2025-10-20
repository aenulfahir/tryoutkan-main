import { useEffect, useState } from "react";
import { Bell, Check, X, ShoppingBag, Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/admin";
import {
  deleteNotification,
  deleteReadNotifications,
  deleteAllNotifications,
} from "@/services/notifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setIsLoading(true);
      const data = await getNotifications(50);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Gagal memuat notifikasi");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Gagal menandai notifikasi sebagai dibaca");
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const count = await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      toast.success(`${count} notifikasi ditandai sebagai telah dibaca`);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Gagal menandai semua notifikasi sebagai dibaca");
    }
  }

  async function handleDeleteNotification(notificationId: string) {
    try {
      const success = await deleteNotification(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
        toast.success("Notifikasi dihapus");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Gagal menghapus notifikasi");
    }
  }

  async function handleDeleteReadNotifications() {
    try {
      const count = await deleteReadNotifications();
      setNotifications((prev) => prev.filter((notif) => !notif.is_read));
      toast.success(`${count} notifikasi dibaca dihapus`);
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      toast.error("Gagal menghapus notifikasi yang dibaca");
    }
  }

  async function handleDeleteAllNotifications() {
    try {
      const count = await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success(`${count} notifikasi dihapus`);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Gagal menghapus semua notifikasi");
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
        return <ShoppingBag className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notifikasi</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifikasi</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Tidak ada notifikasi baru"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Tandai semua dibaca</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeleteReadNotifications}>
                Hapus yang sudah dibaca
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteAllNotifications}
                className="text-red-600"
              >
                Hapus semua notifikasi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Tidak ada notifikasi</h3>
            <p className="text-muted-foreground text-center">
              Belum ada notifikasi yang masuk. Notifikasi akan muncul di sini
              ketika ada aktivitas baru.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.is_read
                  ? "bg-muted/30 border-l-4 border-l-blue-500"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            Baru
                          </Badge>
                        )}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(notification.created_at)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    {notification.data && notification.type === "purchase" && (
                      <div className="bg-muted/50 rounded-md p-3 mt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">User:</span>{" "}
                            {notification.data.user_name}
                          </div>
                          <div>
                            <span className="font-medium">Paket:</span>{" "}
                            {notification.data.package_title}
                          </div>
                          <div>
                            <span className="font-medium">Harga:</span> Rp{" "}
                            {notification.data.purchase_price?.toLocaleString(
                              "id-ID"
                            ) || 0}
                          </div>
                          <div>
                            <span className="font-medium">Waktu:</span>{" "}
                            {new Date(
                              notification.data.purchased_at
                            ).toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-auto p-1"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="h-auto p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
