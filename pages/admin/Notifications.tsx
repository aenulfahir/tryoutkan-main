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
        return <ShoppingBag className="w-5 h-5 text-black" />;
      default:
        return <Bell className="w-5 h-5 text-black" />;
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-white min-h-screen text-black">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight">Notifikasi</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
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
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-white min-h-screen text-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Notifikasi</h1>
          <p className="text-gray-600 font-medium mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Tidak ada notifikasi baru"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Tandai semua dibaca</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 border-2 border-black font-bold hover:bg-gray-100">
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-2 border-black font-medium">
              <DropdownMenuItem onClick={handleDeleteReadNotifications} className="cursor-pointer focus:bg-gray-100">
                Hapus yang sudah dibaca
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteAllNotifications}
                className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
              >
                Hapus semua notifikasi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-black mb-2">Tidak ada notifikasi</h3>
            <p className="text-gray-500 font-medium text-center">
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
              className={`transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${!notification.is_read
                  ? "bg-gray-50"
                  : "bg-white"
                }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 p-2 bg-white border-2 border-black rounded-full">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        {!notification.is_read && (
                          <Badge className="bg-black text-white border-2 border-black font-bold text-xs">
                            Baru
                          </Badge>
                        )}
                        <div className="flex items-center text-xs text-gray-500 font-bold">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(notification.created_at)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-2">
                      {notification.message}
                    </p>
                    {notification.data && notification.type === "purchase" && (
                      <div className="bg-white border-2 border-black rounded-md p-3 mt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-bold">User:</span>{" "}
                            <span className="font-medium">{notification.data.user_name}</span>
                          </div>
                          <div>
                            <span className="font-bold">Paket:</span>{" "}
                            <span className="font-medium">{notification.data.package_title}</span>
                          </div>
                          <div>
                            <span className="font-bold">Harga:</span> <span className="font-black">Rp{" "}
                              {notification.data.purchase_price?.toLocaleString(
                                "id-ID"
                              ) || 0}</span>
                          </div>
                          <div>
                            <span className="font-bold">Waktu:</span>{" "}
                            <span className="font-medium">{new Date(
                              notification.data.purchased_at
                            ).toLocaleString("id-ID")}</span>
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
                        className="h-auto p-1 hover:bg-gray-100 rounded-full"
                        title="Tandai sudah dibaca"
                      >
                        <Check className="w-4 h-4 text-black" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="h-auto p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                      title="Hapus notifikasi"
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
