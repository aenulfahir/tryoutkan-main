import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export async function getNotifications(
  limit: number = 10
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    // Use the database function for better performance
    const { data, error } = await supabase.rpc("get_unread_notification_count");

    if (error) {
      console.error("Error fetching unread notification count:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return 0;
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    // Use the database function
    const { data, error } = await supabase.rpc("mark_notification_as_read", {
      notification_id: notificationId,
    });

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<number> {
  try {
    // Use the database function
    const { data, error } = await supabase.rpc(
      "mark_all_notifications_as_read"
    );

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return 0;
  }
}

export async function createNotification(
  type: string,
  title: string,
  message: string,
  data?: any
): Promise<boolean> {
  try {
    const { error } = await supabase.from("notifications").insert({
      type,
      title,
      message,
      data,
    });

    if (error) {
      console.error("Error creating notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

export async function createPurchaseNotification(
  userId: string,
  userName: string,
  packageId: string,
  packageTitle: string,
  purchasePrice: number,
  purchasedAt: string
): Promise<boolean> {
  const title = "Pembelian Paket Tryout Baru";
  const message = `${userName} telah membeli paket "${packageTitle}"`;

  const notificationData = {
    user_id: userId,
    user_name: userName,
    package_id: packageId,
    package_title: packageTitle,
    purchase_price: purchasePrice,
    purchased_at: purchasedAt,
  };

  return createNotification("purchase", title, message, notificationData);
}

// Subscribe to new notifications
export function subscribeToNotifications(
  callback: (notification: Notification) => void
) {
  const subscription = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return subscription;
}

// Unsubscribe from notifications
export function unsubscribeFromNotifications(subscription: any) {
  supabase.removeChannel(subscription);
}

// Delete notification
export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  try {
    // Use the database function
    const { data, error } = await supabase.rpc("delete_notification", {
      notification_id: notificationId,
    });

    if (error) {
      console.error("Error deleting notification:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

// Delete all read notifications
export async function deleteReadNotifications(): Promise<number> {
  try {
    // Use the database function
    const { data, error } = await supabase.rpc("delete_read_notifications");

    if (error) {
      console.error("Error deleting read notifications:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    return 0;
  }
}

// Delete all notifications
export async function deleteAllNotifications(): Promise<number> {
  try {
    // Use the database function
    const { data, error } = await supabase.rpc("delete_all_notifications");

    if (error) {
      console.error("Error deleting all notifications:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return 0;
  }
}
