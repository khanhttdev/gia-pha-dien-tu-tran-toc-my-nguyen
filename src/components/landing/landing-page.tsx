"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  GitFork,
  Users,
  BookOpen,
  CalendarDays,
  ImageIcon,
  ArrowRight,
  Sparkles,
  Heart,
  TreePine,
} from "lucide-react";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-in");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({
  children,
  className = "",
  delay = "",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal-section ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
}

function AnimatedCounter({ target, label }: { target: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("counted");
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="counter-card text-center space-y-2 p-6 rounded-2xl glass group hover:bg-white/10 transition-all duration-300"
    >
      <div className="text-4xl sm:text-5xl font-serif font-black gold-text">
        {target}
      </div>
      <div className="text-amber-200/70 text-sm font-semibold uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

const features = [
  {
    icon: GitFork,
    title: "Cây Gia Phả Tương Tác",
    desc: "Khám phá mối quan hệ gia đình qua cây gia phả trực quan, có thể phóng to, thu nhỏ và điều hướng.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: BookOpen,
    title: "Sách Gia Phả Số",
    desc: "Lưu giữ câu chuyện, tiểu sử và kỷ niệm của từng thành viên trong dòng họ.",
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: CalendarDays,
    title: "Sự Kiện & Kỷ Niệm",
    desc: "Theo dõi các sự kiện quan trọng, ngày giỗ, lễ hội và hoạt động của dòng họ.",
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Users,
    title: "Danh Bạ Gia Đình",
    desc: "Kết nối dễ dàng với các thành viên qua danh bạ thông tin liên lạc đầy đủ.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: ImageIcon,
    title: "Thư Viện Ảnh",
    desc: "Bộ sưu tập hình ảnh quý giá từ các thế hệ — ảnh gia đình, sự kiện, di tích.",
    color: "from-slate-500/20 to-gray-500/20",
    iconColor: "text-slate-400",
  },
  {
    icon: Sparkles,
    title: "Trợ Lý AI Mei",
    desc: "Hỏi đáp thông minh về gia phả: tìm quan hệ, tra cứu thông tin, gợi ý câu chuyện.",
    color: "from-cyan-500/20 to-sky-500/20",
    iconColor: "text-cyan-400",
  },
];

export function LandingPage({
  authState = "unauthenticated",
  stats = { generations: 6, totalMembers: 420, yearsOfHistory: 180 },
}: {
  authState?: "unauthenticated" | "pending" | "approved";
  stats?: { generations: number; totalMembers: number; yearsOfHistory: number };
}) {
  return (
    <div className="min-h-screen overflow-x-hidden font-sans">
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px] animate-pulse"
            style={{ animationDuration: "6s" }}
          />
          <div
            className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-amber-600/6 blur-[120px] animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          <div className="absolute top-[40%] right-[30%] w-[200px] h-[200px] rounded-full bg-rose-500/4 blur-[80px]" />
        </div>

        {/* Heritage pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div
          aria-label="landing-wrapper"
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-8 flex items-center justify-center hero-logo p-1 drop-shadow-2xl">
            <img
              src="/logo.webp"
              alt="Trần Tộc Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-foreground leading-[1.1] tracking-tight mb-6">
            Gia Phả <span className="gold-text">Trần Tộc</span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl text-amber-200/80">
              Mỹ Nguyên
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10 font-medium">
            &quot;Uống nước nhớ nguồn, ân sâu nghĩa nặng.&quot;
            <br className="hidden sm:block" />
            Gia phả trực tuyến — Cầu nối thiêng liêng giữa hiện tại và cội
            nguồn.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col flex-wrap sm:flex-row gap-4 justify-center items-center">
            {authState === "unauthenticated" ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gold-gradient text-amber-950 font-bold text-base shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto"
                >
                  Đăng nhập
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass text-foreground font-semibold text-base hover:bg-white/10 transition-all duration-300 border border-border/50 w-full sm:w-auto"
                >
                  Đăng ký tài khoản
                </Link>
              </>
            ) : authState === "pending" ? (
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-orange-500/20 text-orange-200 font-bold text-base shadow-lg border border-orange-500/50 mb-3 cursor-default">
                  <span className="animate-pulse">⏳</span> Tài khoản của bạn
                  đang chờ phê duyệt
                </div>
                <p className="text-sm text-muted-foreground max-w-sm text-center">
                  Quản trị viên đang xem xét thông tin của bạn. Vui lòng quay
                  lại sau khi tài khoản được kích hoạt để xem Cây Gia Phả.
                </p>
              </div>
            ) : (
              <Link
                href="/home"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gold-gradient text-amber-950 font-bold text-base shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                Đi đến Trang chủ
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* User Guide Link from Hero */}
          <div className="mt-8">
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 text-sm text-amber-200/60 hover:text-amber-200 transition-colors uppercase tracking-widest font-semibold border-b border-amber-200/30 hover:border-amber-200 pb-1"
            >
              <BookOpen className="w-4 h-4" /> Xem Hướng dẫn sử dụng
            </Link>
          </div>

          {/* Scroll hint */}
          <div
            className="mt-12 sm:mt-16 animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50 animate-scroll-dot" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ LỊCH SỬ DÒNG HỘ ============ */}
      <section className="relative py-20 sm:py-28 px-6 bg-black/40 border-y border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-amber-200/80 text-xs font-bold uppercase tracking-widest mb-8 border border-amber-500/20">
              <Heart className="w-3.5 h-3.5" />
              Tự Hào Nguồn Cội
            </div>
          </RevealSection>

          <RevealSection delay="100ms">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-8 leading-tight">
              Hào khí ngàn năm,{" "}
              <span className="gold-text">lưu danh muôn thủa</span>
            </h2>
          </RevealSection>

          <RevealSection delay="200ms">
            <div className="space-y-6 text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-4xl mx-auto mb-10 text-justify sm:text-center text-foreground/80 font-serif">
              <p>
                Truyền thống vẻ vang của{" "}
                <strong className="text-amber-200">Trần Tộc Mỹ Nguyên</strong>{" "}
                được bồi đắp qua biết bao thăng trầm của lịch sử. Từ thuở khai
                hoang lập ấp, các bậc tiên tổ đã dốc lòng vun trồng mảnh đất quê
                hương, truyền lại cho con cháu tấm gương lao động cần cù, tinh
                thần quả cảm và lòng yêu thương nòi giống.
              </p>
              <p>
                Gia phả không chỉ là danh sách những cái tên khô khan, mà là{" "}
                <em>những trang sử sống động</em>, thấm đẫm mồ hôi và nước mắt
                của bao thế hệ. Nền tảng số hóa này ra đời với khát vọng lưu giữ
                từng mảnh ghép ký ức, làm sống lại những di sản tinh thần và tạo
                dựng nhịp cầu giao cảm để các thế hệ Trần Tộc, dù ở muôn phương,
                vẫn mãi hướng về cội nguồn.
              </p>
            </div>
          </RevealSection>

          <RevealSection delay="300ms">
            <div className="flex items-center justify-center gap-8 text-muted-foreground/60">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/50" />
              <TreePine className="w-6 h-6 text-amber-500/70" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ============ TÍNH NĂNG ============ */}
      <section className="relative py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-amber-200/80 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Tính Năng Nổi Bật
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
              Công nghệ kết nối <span className="gold-text">huyết thống</span>
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <RevealSection key={f.title} delay={`${i * 80}ms`}>
                <div className="group relative p-8 rounded-3xl glass border border-border/30 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl h-full overflow-hidden bg-black/20">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
                  />
                  <div className="relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${f.iconColor} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg`}
                    >
                      <f.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-foreground mb-3">
                      {f.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ THỐNG KÊ ============ */}
      <section className="relative py-20 sm:py-28 px-6 border-y border-border/30 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Trần Tộc qua <span className="gold-text">những con số</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Hệ thống đang lưu trữ và quản lý dữ liệu thực tế khổng lồ.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <AnimatedCounter target={String(stats.generations)} label="Thế hệ" />
            <AnimatedCounter target={`${stats.totalMembers}+`} label="Thành viên" />
            <AnimatedCounter target={`${stats.yearsOfHistory}+`} label="Năm lịch sử" />
          </div>
        </div>
      </section>

      {/* ============ CTA CUỐI ============ */}
      <section className="relative py-20 sm:py-28 px-6">
        <RevealSection>
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-12 sm:p-20 rounded-[2.5rem] overflow-hidden shadow-2xl">
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-primary/10 to-rose-500/15" />
              <div className="absolute inset-0 glass" />
              <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              <div className="relative z-10 flex flex-col items-center">
                <span className="text-6xl mb-6 block drop-shadow-xl">🏡</span>
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                  Tiếp bước tiền nhân,
                  <br />
                  <span className="gold-text">Rạng danh hậu thế</span>
                </h2>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                  Tham gia cùng chúng tôi để chung tay xây dựng, bồi đắp cuốn
                  Gia phả điện tử — một di sản vô giá, trường tồn cùng thời
                  gian.
                </p>

                {authState === "unauthenticated" ? (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl gold-gradient text-amber-950 font-bold text-lg shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] hover:scale-[1.03] transition-all duration-300"
                  >
                    Gia nhập Đăng ký ngay
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : authState === "pending" ? (
                  <div className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass border-amber-500/40 text-amber-200">
                    Tài khoản đang chờ BQT phê duyệt
                  </div>
                ) : (
                  <Link
                    href="/home"
                    className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl gold-gradient text-amber-950 font-bold text-lg shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:scale-[1.03] transition-all duration-300"
                  >
                    Về Trang Chủ Của Họ
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative py-12 px-6 border-t border-border/30 bg-background/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl drop-shadow-md">🌳</span>
              <span className="font-serif font-bold text-lg text-foreground/90 uppercase tracking-wider">
                Trần Tộc Mỹ Nguyên
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/guide"
              className="hover:text-amber-400 transition-colors"
            >
              Hướng dẫn sử dụng
            </Link>
            <a
              href="mailto:contact@giapho.vn"
              className="hover:text-amber-400 transition-colors"
            >
              Liên hệ BQT
            </a>
          </div>

          <p>
            © {new Date().getFullYear()} Nền tảng Gia Phả Điện Tử. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
