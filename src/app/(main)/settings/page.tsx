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
import { Loader2, UserCog, ShieldCheck, BellRing, UserCircle } from "lucide-react";
import { MFAEnroll } from "@/components/auth/mfa-enroll";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        const { data: p } = await sb
          .from("profiles")
          .select("id, full_name, avatar_url, role")
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
        console.error("SettingsPage: Profile load failed:", err);
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
    const upsertData: any = {
      id: userId,
      full_name: form.full_name,
      avatar_url: form.avatar_url,
      updated_at: new Date().toISOString(),
    };

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
        <Loader2 className="w-10 h-10 animate-spin text-heritage-gold" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-heritage-gold/10 glass">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center shadow-xl">
            <UserCog className="w-5 h-5 text-heritage-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold royal-text-gradient leading-none">Cài Đặt Tài Khoản</h1>
            <p className="text-xs text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
              Quản lý thông tin cá nhân và cấu hình bảo mật của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Profile Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <UserCircle className="w-5 h-5 text-heritage-gold" />
              <h2 className="text-lg font-serif font-bold text-heritage-gold uppercase tracking-widest">Hồ Sơ Cá Nhân</h2>
            </div>

            <Card className="p-8 md:p-10 border-heritage-gold/10 relative overflow-hidden group hover:royal-gold-glow transition-all duration-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-heritage-gold/5 rounded-full blur-[80px] -z-10 -translate-y-1/2 translate-x-1/3 group-hover:bg-heritage-gold/10 transition-colors" />

              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12">
                {/* Avatar Column */}
                <div className="space-y-4">
                  <Label className="text-heritage-gold-dim text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 px-1">Ảnh đại diện</Label>
                  <div className="royal-halo bg-black/40 p-1.5 inline-block mx-auto md:mx-0 shadow-2xl">
                    <ImageUpload
                      bucket="avatars"
                      value={form.avatar_url}
                      onChange={(url) => setForm((f) => ({ ...f, avatar_url: url }))}
                    />
                  </div>
                  <p className="text-[10px] text-heritage-gold-dim italic font-medium leading-relaxed opacity-50 px-1">
                    Ảnh sẽ được hiển thị trên hệ thống gia phả và menu chính.
                  </p>
                </div>

                {/* Form Column */}
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label className="text-heritage-gold-dim text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 px-1">Địa chỉ Email</Label>
                      <Input
                        value={userEmail}
                        readOnly
                        className="h-12 bg-black/40 border-heritage-gold/10 text-heritage-gold opacity-60 cursor-not-allowed rounded-xl font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-heritage-gold-dim text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 px-1">Họ và tên hiển thị</Label>
                      <Input
                        value={form.full_name}
                        onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                        placeholder="Nhập họ và tên..."
                        className="h-12 bg-royal-card border-heritage-gold/20 text-heritage-gold focus:border-heritage-gold/50 rounded-xl font-serif text-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end items-center gap-6 border-t border-heritage-gold/5">
                    <p className="hidden sm:block text-[10px] text-heritage-gold-dim italic opacity-40">
                      Cập nhật lần cuối: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="gold-gradient border-0 text-amber-950 font-bold px-10 h-11 rounded-xl shadow-2xl shadow-amber-500/10 hover:opacity-90 transition-opacity"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Lưu Thay Đổi
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Security Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <ShieldCheck className="w-5 h-5 text-heritage-gold" />
                <h2 className="text-lg font-serif font-bold text-heritage-gold uppercase tracking-widest">Bảo Mật</h2>
              </div>
              <Card className="p-8 border-heritage-gold/10 hover:border-heritage-gold/30 transition-all duration-500 bg-heritage-maroon/20">
                <MFAEnroll />
              </Card>
            </section>

            {/* Notifications Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <BellRing className="w-5 h-5 text-heritage-gold" />
                <h2 className="text-lg font-serif font-bold text-heritage-gold uppercase tracking-widest">Thông Báo</h2>
              </div>
              <Card className="p-8 border-heritage-gold/10 hover:border-heritage-gold/30 transition-all duration-500 bg-heritage-maroon/20">
                <NotificationSettings />
              </Card>
            </section>
          </div>

          {/* Footer Branding */}
          <div className="text-center py-10 opacity-20 space-y-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-heritage-gold to-transparent mx-auto" />
            <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-heritage-gold">
              TRẦN TỘC MỸ NGUYÊN · VERSION 2.5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
