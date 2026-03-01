"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không đúng"
          : error.message,
      );
      return;
    }
    toast.success("Đăng nhập thành công!");
    router.push("/home");
    router.refresh();
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/home`,
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — decorative heritage */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-background border-r border-border/50">
        {/* Traditional Asian-inspired SVG Pattern */}
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/90 mix-blend-multiply" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center h-full w-full">
          <div className="w-24 h-24 mb-6 flex items-center justify-center p-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
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

      {/* Right panel — login form */}
      <div className="flex-1 flex justify-center items-center p-6 sm:p-12 relative overflow-hidden">
        {/* Soft ambient glows for Right Panel */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10 glass p-8 sm:p-10 rounded-3xl shadow-sm border border-border/50">
          {/* Mobile internal logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center p-1">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Trần Tộc Mỹ Nguyên
            </h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Đăng nhập
            </h2>
            <p className="text-muted-foreground mt-2 text-sm font-medium">
              Chào mừng trở lại, thành viên dòng họ 👋
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                className="h-11 rounded-xl bg-white border-border/80 focus:ring-amber-500/30 transition-shadow text-amber-950 font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2">
                <Label
                  htmlFor="password"
                  className="text-foreground/80 font-semibold"
                >
                  Mật khẩu
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  className="h-11 rounded-xl bg-white border-border/80 focus:ring-amber-500/30 transition-shadow text-amber-950 font-medium pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl gold-gradient border-0 text-amber-950 font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Đăng nhập
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-4 text-muted-foreground font-medium rounded-full border border-border/30">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl gap-3 font-semibold bg-white hover:bg-gray-50 border-border/80 transition-colors shadow-sm"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Account
          </Button>

          <p className="text-center text-sm text-muted-foreground font-medium pt-2">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-amber-600 font-bold hover:text-amber-700 hover:underline transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
