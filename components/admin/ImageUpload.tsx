import { useState, useCallback } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File | null) => void;
  bucket?: string;
  folder?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onFileChange,
  bucket = "tryout-thumbnails",
  folder = "thumbnails",
  maxSize = 5,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string>(value || "");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`Ukuran file maksimal ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      setUploading(true);
      setProgress(0);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Notify parent about file change
      onFileChange?.(file);

      // Upload to Supabase
      const url = await uploadToSupabase(file);
      onChange(url);

      toast.success("Gambar berhasil diupload");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal upload gambar");
      setPreview("");
      onFileChange?.(null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    onFileChange?.(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {!preview && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragActive
              ? "border-black bg-gray-50"
              : "border-gray-300 hover:border-black",
            uploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
            title="Upload gambar"
            aria-label="Upload gambar"
          />

          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-black animate-spin" />
                <div className="w-full max-w-xs">
                  <Progress value={progress} className="h-2 border-2 border-black bg-gray-100" />
                  <p className="text-sm font-medium text-gray-600 mt-2">
                    Uploading... {progress}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">
                    Drag & drop gambar atau klik untuk upload
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    PNG, JPG, GIF hingga {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && !uploading && (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="bg-red-600 hover:bg-red-700 border-2 border-red-800 font-bold"
            >
              <X className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
