"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getVietnameseAuthError } from "@/lib/auth-errors";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Địa chỉ email không hợp lệ");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(getVietnameseAuthError(error.message));
      return;
    }

    setIsSent(true);
    toast.success("Link khôi phục mật khẩu đã được gửi!");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — decorative heritage */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-background border-r border-border/50">
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/90 mix-blend-multiply" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center h-full w-full">
          <div className="w-24 h-24 mb-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
            <span className="text-6xl drop-shadow-lg">🌳</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight font-serif">
            Gia Phả <br />
            <span className="text-primary">Trần Tộc Mỹ Nguyên</span>
          </h1>
          <p className="text-amber-100/80 text-lg max-w-sm leading-relaxed font-medium">
            Lưu giữ cội nguồn,
            <br />
            Kết nối các thế hệ qua thời gian
          </p>

          <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-md">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-white font-serif">4+</div>
              <div className="text-amber-200/70 text-sm font-medium uppercase tracking-wider">
                Thế hệ
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-white font-serif">
                18+
              </div>
              <div className="text-amber-200/70 text-sm font-medium uppercase tracking-wider">
                Thành viên
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-white font-serif">
                100+
              </div>
              <div className="text-amber-200/70 text-sm font-medium uppercase tracking-wider">
                Năm lịch sử
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — forgot password form */}
      <div className="flex-1 flex justify-center items-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10 glass p-8 sm:p-10 rounded-3xl shadow-sm border border-border/50">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
              <span className="text-3xl">🌳</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Trần Tộc Mỹ Nguyên
            </h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Quên Mật Khẩu
            </h2>
            <p className="text-muted-foreground mt-2 text-sm font-medium">
              Nhập email của bạn để nhận liên kết khôi phục
            </p>
          </div>

          {isSent ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <h3 className="text-green-600 font-bold mb-2">Đã gửi email</h3>
                <p className="text-sm text-green-600/80">
                  Vui lòng kiểm tra hộp thư đến của bạn để lấy lại mật khẩu. Có
                  thể mất vài phút.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl"
                onClick={() => router.push("/login")}
              >
                Quay về trang Đăng nhập
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-foreground/80 font-semibold"
                >
                  Địa chỉ Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ten@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  className="h-11 rounded-xl bg-white/50 border-border/80 focus:bg-white transition-colors"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl gold-gradient border-0 text-amber-950 font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all"
                disabled={loading}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                Gửi liên kết
              </Button>
            </form>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground font-medium pt-2">
            Nhớ mật khẩu?{" "}
            <Link
              href="/login"
              className="text-amber-600 font-bold hover:text-amber-700 hover:underline transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
