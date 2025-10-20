import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Upload image to Supabase Storage
 * @param file - Image file to upload
 * @param path - Path in bucket (e.g., "questions", "thumbnails/package-id")
 * @returns Public URL of uploaded image or null if failed
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<string | null> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Ukuran gambar maksimal 5MB");
      return null;
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("tryout-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      toast.error("Gagal upload gambar: " + error.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("tryout-assets")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      toast.error("Gagal mendapatkan URL gambar");
      return null;
    }

    return urlData.publicUrl;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    toast.error("Gagal upload gambar: " + error.message);
    return null;
  }
}

/**
 * Delete image from Supabase Storage
 * @param url - Public URL of image to delete
 * @returns true if successful, false otherwise
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract path from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/tryout-assets/{path}
    const urlParts = url.split("/tryout-assets/");
    if (urlParts.length < 2) {
      console.error("Invalid image URL:", url);
      return false;
    }

    const filePath = urlParts[1];

    // Delete from storage
    const { error } = await supabase.storage
      .from("tryout-assets")
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Upload multiple images
 * @param files - Array of image files
 * @param path - Path in bucket
 * @returns Array of public URLs
 */
export async function uploadMultipleImages(
  files: File[],
  path: string
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    const url = await uploadImage(file, path);
    if (url) {
      urls.push(url);
    }
  }

  return urls;
}

/**
 * Compress image before upload (optional)
 * @param file - Image file to compress
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - Quality (0-1)
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

/**
 * Upload image with compression
 * @param file - Image file to upload
 * @param path - Path in bucket
 * @param compress - Whether to compress before upload
 * @returns Public URL of uploaded image or null if failed
 */
export async function uploadImageWithCompression(
  file: File,
  path: string,
  compress: boolean = true
): Promise<string | null> {
  try {
    let fileToUpload = file;

    if (compress && file.size > 500 * 1024) {
      // Compress if > 500KB
      toast.info("Mengompres gambar...");
      fileToUpload = await compressImage(file);
    }

    return await uploadImage(fileToUpload, path);
  } catch (error: any) {
    console.error("Error uploading with compression:", error);
    toast.error("Gagal upload gambar: " + error.message);
    return null;
  }
}
