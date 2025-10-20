/**
 * Admin Service Functions
 *
 * Service functions untuk admin dashboard operations
 * Includes: authentication, user management, tryout management, analytics, dll
 */

import { supabase } from "@/lib/supabase";
import type { TryoutPackage } from "@/types/tryout";

// =====================================================
// AUTHENTICATION & AUTHORIZATION
// =====================================================

/**
 * Check if current user is admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data?.role === "admin";
  } catch (error) {
    console.error("Error in checkIsAdmin:", error);
    return false;
  }
}

/**
 * Get current user's role
 */
export async function getUserRole(): Promise<"user" | "admin" | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error getting user role:", error);
      return null;
    }

    return data?.role || "user";
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return null;
  }
}

/**
 * Get admin profile
 */
export async function getAdminProfile() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No user found");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    // Verify user is admin
    if (data?.role !== "admin") {
      throw new Error("User is not an admin");
    }

    return data;
  } catch (error) {
    console.error("Error getting admin profile:", error);
    throw error;
  }
}

// =====================================================
// ACTIVITY LOGGING
// =====================================================

/**
 * Log admin activity
 */
export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  oldValue?: any,
  newValue?: any
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found for activity logging");
      return;
    }

    const { error } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
    });

    if (error) {
      console.error("Error logging activity:", error);
    }
  } catch (error) {
    console.error("Error in logActivity:", error);
  }
}

/**
 * Get activity logs
 */
export async function getActivityLogs(filters?: {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  try {
    let query = supabase
      .from("activity_logs")
      .select(
        `
        *,
        user:profiles!activity_logs_user_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `
      )
      .order("created_at", { ascending: false });

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }

    if (filters?.action) {
      query = query.eq("action", filters.action);
    }

    if (filters?.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting activity logs:", error);
    throw error;
  }
}

// =====================================================
// NOTIFICATIONS
// =====================================================

/**
 * Create notification for user
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  link?: string
) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      message,
      type,
      link,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Get notifications for admin
 */
export async function getNotifications(limit = 50) {
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

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    // Use the database function
    const { data, error } = await supabase.rpc("mark_notification_as_read", {
      notification_id: notificationId,
    });

    if (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }

    return data || false;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    // Use the database function
    const { data, error } = await supabase.rpc(
      "mark_all_notifications_as_read"
    );

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }

    return data || 0;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Get unread notification count
 */
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

// =====================================================
// TRYOUT PACKAGE MANAGEMENT
// =====================================================

/**
 * Get all tryout packages
 */
export async function getTryoutPackages() {
  try {
    const { data, error } = await supabase
      .from("tryout_packages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting tryout packages:", error);
    throw error;
  }
}

/**
 * Create new tryout package
 */
export async function createTryoutPackage(
  packageData: Omit<TryoutPackage, "id" | "created_at" | "updated_at">
) {
  try {
    const { data, error } = await supabase
      .from("tryout_packages")
      .insert([packageData])
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity("create", "tryout_package", data.id, null, packageData);

    return data;
  } catch (error) {
    console.error("Error creating tryout package:", error);
    throw error;
  }
}

/**
 * Update tryout package
 */
export async function updateTryoutPackage(
  id: string,
  packageData: Partial<TryoutPackage>
) {
  try {
    // Get old data for logging
    const { data: oldData } = await supabase
      .from("tryout_packages")
      .select("*")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("tryout_packages")
      .update(packageData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity("update", "tryout_package", id, oldData, packageData);

    return data;
  } catch (error) {
    console.error("Error updating tryout package:", error);
    throw error;
  }
}

/**
 * Delete tryout package
 */
export async function deleteTryoutPackage(id: string) {
  try {
    // Get data for logging
    const { data: packageData } = await supabase
      .from("tryout_packages")
      .select("*")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("tryout_packages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Log activity
    await logActivity("delete", "tryout_package", id, packageData, null);

    return true;
  } catch (error) {
    console.error("Error deleting tryout package:", error);
    throw error;
  }
}

/**
 * Upload thumbnail to Supabase Storage
 */
export async function uploadThumbnail(
  file: File,
  folder: string = "thumbnails"
): Promise<string> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("tryout-thumbnails")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("tryout-thumbnails").getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    throw error;
  }
}
