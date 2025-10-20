import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import {
  uploadCurrentUserAvatar,
  deleteCurrentUserAvatar,
} from "@/services/profile";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userName: string;
  onAvatarChange: (newAvatarUrl: string | null) => void;
}

export default function AvatarUpload({
  currentAvatarUrl,
  userName,
  onAvatarChange,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format File Tidak Valid", {
        description: "Hanya file JPEG, PNG, dan WebP yang diperbolehkan.",
      });
      return;
    }

    try {
      setUploading(true);

      // Compress image
      const options = {
        maxSizeMB: 0.2, // 200KB max
        maxWidthOrHeight: 800, // 800px max dimension
        useWebWorker: true,
        fileType: file.type,
      };

      toast.info("Mengkompress gambar...");
      const compressedFile = await imageCompression(file, options);

      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);

      console.log(
        `Image compressed: ${originalSize}MB → ${compressedSize}MB (${(
          (1 - compressedFile.size / file.size) *
          100
        ).toFixed(0)}% reduction)`
      );

      const publicUrl = await uploadCurrentUserAvatar(compressedFile);

      onAvatarChange(publicUrl);

      toast.success("Foto Profil Berhasil Diupload", {
        description: `Ukuran: ${originalSize}MB → ${compressedSize}MB`,
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Gagal Upload Foto Profil", {
        description: error.message || "Terjadi kesalahan saat upload foto.",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setDeleting(true);

      await deleteCurrentUserAvatar();

      onAvatarChange(null);

      toast.success("Foto Profil Berhasil Dihapus", {
        description: "Foto profil Anda telah dihapus.",
      });
    } catch (error: any) {
      console.error("Error deleting avatar:", error);
      toast.error("Gagal Hapus Foto Profil", {
        description: error.message || "Terjadi kesalahan saat hapus foto.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        <Avatar className="w-32 h-32 border-4 border-border">
          {currentAvatarUrl ? (
            <AvatarImage src={currentAvatarUrl} alt={userName} />
          ) : (
            <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
              {getInitials(userName)}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Upload/Delete Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleClickUpload}
          disabled={uploading || deleting}
          variant="outline"
          size="sm"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              {currentAvatarUrl ? "Ganti Foto" : "Upload Foto"}
            </>
          )}
        </Button>

        {currentAvatarUrl && (
          <Button
            onClick={handleDeleteAvatar}
            disabled={uploading || deleting}
            variant="outline"
            size="sm"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </>
            )}
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Format: JPEG, PNG, WebP. Otomatis dikompres menjadi max 200KB.
      </p>
    </div>
  );
}
