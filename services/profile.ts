import { supabase } from "@/lib/supabase";

// =====================================================
// TYPES
// =====================================================

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
}

// =====================================================
// PROFILE CRUD OPERATIONS
// =====================================================

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    console.log("📋 Fetching profile for user:", userId);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Error fetching profile:", error);
      throw error;
    }

    console.log("✅ Profile fetched:", data);
    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    return await getUserProfile(user.id);
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: ProfileUpdateData
): Promise<Profile | null> {
  try {
    console.log("💾 Updating profile for user:", userId, profileData);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating profile:", error);
      throw error;
    }

    console.log("✅ Profile updated:", data);
    return data;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
}

/**
 * Update current user's profile
 */
export async function updateCurrentUserProfile(
  profileData: ProfileUpdateData
): Promise<Profile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No authenticated user found");
    }

    return await updateUserProfile(user.id, profileData);
  } catch (error) {
    console.error("Error in updateCurrentUserProfile:", error);
    throw error;
  }
}

// =====================================================
// AVATAR UPLOAD OPERATIONS
// =====================================================

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  try {
    console.log("📤 Uploading avatar for user:", userId);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed."
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 2MB.");
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    console.log("📁 Uploading file:", fileName);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("❌ Error uploading avatar:", error);
      throw error;
    }

    console.log("✅ Avatar uploaded:", data);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    console.log("🔗 Public URL:", publicUrl);

    // Update profile with new avatar URL
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadAvatar:", error);
    throw error;
  }
}

/**
 * Upload avatar for current user
 */
export async function uploadCurrentUserAvatar(file: File): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No authenticated user found");
    }

    return await uploadAvatar(user.id, file);
  } catch (error) {
    console.error("Error in uploadCurrentUserAvatar:", error);
    throw error;
  }
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(userId: string): Promise<void> {
  try {
    console.log("🗑️ Deleting avatar for user:", userId);

    // Get current profile to find avatar URL
    const profile = await getUserProfile(userId);
    if (!profile || !profile.avatar_url) {
      console.log("No avatar to delete");
      return;
    }

    // Extract file path from URL
    const url = new URL(profile.avatar_url);
    const pathParts = url.pathname.split("/");
    const filePath = pathParts.slice(pathParts.indexOf("avatars") + 1).join("/");

    console.log("📁 Deleting file:", filePath);

    // Delete from storage
    const { error } = await supabase.storage.from("avatars").remove([filePath]);

    if (error) {
      console.error("❌ Error deleting avatar:", error);
      throw error;
    }

    // Update profile to remove avatar URL
    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    console.log("✅ Avatar deleted");
  } catch (error) {
    console.error("Error in deleteAvatar:", error);
    throw error;
  }
}

/**
 * Delete avatar for current user
 */
export async function deleteCurrentUserAvatar(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No authenticated user found");
    }

    return await deleteAvatar(user.id);
  } catch (error) {
    console.error("Error in deleteCurrentUserAvatar:", error);
    throw error;
  }
}

