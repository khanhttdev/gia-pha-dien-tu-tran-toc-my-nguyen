"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { Loader2, UserCog } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", avatar_url: "" });
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const sb = createClient();
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        setLoading(false);
        return;
      }
      setUserEmail(data.user.email || "");
      setUserId(data.user.id);

      try {
        // If single() fails (e.g., no row), it throws logic to catch or returns data as null
        const { data: p } = await sb
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        if (p) {
          setProfile(p as Profile);
          setForm({
            full_name: p.full_name || "",
            avatar_url: p.avatar_url || "",
          });
        }
      } catch (err) {
        console.log("Profile not found or error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const sb = createClient();
    // Prevent violating profiles_role_check constraint when upserting a new row.
    const upsertData: any = {
      id: userId,
      full_name: form.full_name,
      avatar_url: form.avatar_url,
      updated_at: new Date().toISOString(),
    };

    // If it's a completely new profile, we must provide the required fields like role
    if (!profile) {
      upsertData.role = "member";
      upsertData.email = userEmail;
      upsertData.is_active = false;
    }

    const { error } = await sb.from("profiles").upsert(upsertData);

    if (error) {
      toast.error("Lỗi khi lưu: " + error.message);
    } else {
      toast.success("Đã cập nhật hồ sơ thành công!");
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent flex items-center gap-2 mb-8">
        <UserCog className="w-6 h-6 text-amber-500" />
        Hồ Sơ Cá Nhân
      </h1>

      <div className="glass p-6 md:p-8 rounded-2xl border border-white/10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Ảnh đại diện (Avatar)</Label>
            <ImageUpload
              bucket="avatars"
              value={form.avatar_url}
              onChange={(url) => setForm((f) => ({ ...f, avatar_url: url }))}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Ảnh đại diện sẽ hiển thị ở menu bên trái.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Email{" "}
              <span className="text-muted-foreground font-normal">
                (Chỉ đọc)
              </span>
            </Label>
            <Input
              value={userEmail}
              readOnly
              className="opacity-70 bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Họ và tên hiển thị</Label>
            <Input
              value={form.full_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, full_name: e.target.value }))
              }
              placeholder="Trần Văn A"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gold-gradient text-amber-950 font-semibold px-8"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Lưu Thay Đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
