"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  bucket?: "media" | "avatars";
  className?: string;
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "media",
  className = "",
  accept = "image/*,video/*",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const sb = createClient();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${Date.now()}-${fileName}`;

      const { error: uploadError } = await sb.storage
        .from(bucket)
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = sb.storage.from(bucket).getPublicUrl(filePath);
      onChange(publicUrl);
      toast.success("Đã tải file lên thành công!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Lỗi khi tải file: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {value ? (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/50 group bg-muted flex items-center justify-center">
          {value.match(/\.(mp4|webm|mov)$/i) ? (
            <span className="text-3xl">🎬</span>
          ) : (
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="96px"
            />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <label
            className={`cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <input
              type="file"
              accept={accept}
              capture="environment"
              className="hidden"
              onChange={onFileChange}
              disabled={uploading}
            />
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 transition-colors">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">
                {uploading ? "Đang tải lên..." : "Chọn file từ thiết bị"}
              </span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
