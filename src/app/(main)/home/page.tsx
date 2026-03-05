import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Member } from "@/lib/types";
import {
  GitFork,
  Users,
  BookOpen,
  CalendarDays,
  ImageIcon,
  Phone,
  TrendingUp,
  Clock,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickLinks = [
  {
    href: "/tree",
    label: "Cây Gia Phả",
    icon: GitFork,
    color: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-heritage-gold",
  },
  {
    href: "/people",
    label: "Thành Viên",
    icon: Users,
    color: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-heritage-gold",
  },
  {
    href: "/directory",
    label: "Danh Bạ",
    icon: Phone,
    color: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-heritage-gold",
  },
  {
    href: "/book",
    label: "Sách Gia Phả",
    icon: BookOpen,
    color: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-heritage-gold",
  },
  {
    href: "/events",
    label: "Sự Kiện",
    icon: CalendarDays,
    color: "from-cyan-500/10 to-sky-500/10",
    iconColor: "text-heritage-gold",
  },
  {
    href: "/media",
    label: "Thư Viện Ảnh",
    icon: ImageIcon,
    color: "from-slate-500/10 to-gray-500/10",
    iconColor: "text-heritage-gold",
  },
  {
    href: "/board",
    label: "Bảng Tin",
    icon: MessageSquare,
    color: "from-amber-500/10 to-yellow-500/10",
    iconColor: "text-heritage-gold",
  },
];

const getTimeAgo = (dateStr: string | null) => {
  if (!dateStr) return "Gần đây";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = (await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()) as { data: { full_name: string | null; role: string } | null };

  // Fetch stats
  const { count: totalMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });

  const { data: genData } = (await supabase
    .from("members")
    .select("generation_level")
    .order("generation_level", { ascending: false })
    .limit(1)
    .single()) as { data: { generation_level: number } | null };

  // Recent updates
  const { data: recentPeople } = (await supabase
    .from("members")
    .select("id, full_name, gender, generation_level, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5)) as {
      data:
      | Pick<
        Member,
        "id" | "full_name" | "gender" | "generation_level" | "updated_at"
      >[]
      | null;
    };

  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Thành viên";
  const maxGen = genData?.generation_level ?? 0;

  return (
    <div
      aria-label="home"
      className="p-6 sm:p-8 max-w-6xl mx-auto space-y-10 page-enter"
    >
      {/* Royal Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-8 sm:p-10 bg-royal-card border border-heritage-gold/20 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-20" />

        {/* Ornamental corners inside banner */}
        <svg className="absolute top-3 left-3 w-10 h-10 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-700 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
          <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
        </svg>
        <svg className="absolute top-3 right-3 w-10 h-10 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-700 pointer-events-none rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
          <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
        </svg>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 royal-halo bg-heritage-gold/10 flex items-center justify-center text-4xl shadow-xl">
            🌳
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold royal-text-gradient mb-2">
              Chào mừng, {displayName}
            </h1>
            <p className="text-heritage-gold-dim font-medium italic">
              Lưu giữ cội nguồn — Truyền cảm hứng cho mai sau. Chào mừng anh quay lại gia đình Trần Tộc Mỹ Nguyên.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="royal-gold-glow border-heritage-gold/30">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="w-12 h-12 royal-halo bg-heritage-gold/5 transition-transform group-hover:scale-110 duration-500">
              <Users className="w-6 h-6 text-heritage-gold" />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.2em] text-heritage-gold-dim/70 font-bold">Thành viên</p>
              <CardTitle className="text-3xl mt-1">{totalMembers ?? 0}</CardTitle>
            </div>
          </CardHeader>
        </Card>

        <Card className="royal-gold-glow border-heritage-gold/30">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="w-12 h-12 royal-halo bg-heritage-gold/5 transition-transform group-hover:scale-110 duration-500">
              <TrendingUp className="w-6 h-6 text-heritage-gold" />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.2em] text-heritage-gold-dim/70 font-bold">Thế hệ</p>
              <CardTitle className="text-3xl mt-1">{maxGen}</CardTitle>
            </div>
          </CardHeader>
        </Card>

        <Card className="royal-gold-glow border-heritage-gold/30">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="w-12 h-12 royal-halo bg-heritage-gold/5 transition-transform group-hover:scale-110 duration-500">
              <Clock className="w-6 h-6 text-heritage-gold" />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.2em] text-heritage-gold-dim/70 font-bold">Cập nhật</p>
              <CardTitle className="text-3xl mt-1">{recentPeople?.length ?? 0}</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-serif font-bold royal-text-gradient mb-6 ml-1">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative p-4 rounded-2xl bg-royal-card border border-heritage-gold/20 hover:border-heritage-gold transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(252,211,77,0.2)] text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-20" />
              <div className="relative z-10">
                <div className={`w-12 h-12 mx-auto royal-halo bg-heritage-gold/5 mb-3 group-hover:scale-110 transition-transform duration-500`}>
                  <link.icon className={`w-6 h-6 ${link.iconColor}`} />
                </div>
                <p className="text-[11px] font-bold text-heritage-gold/80 group-hover:text-heritage-gold uppercase tracking-wider transition-colors">
                  {link.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentPeople && recentPeople.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold royal-text-gradient ml-1">
            Hoạt động gần đây
          </h2>
          <Card className="overflow-hidden border border-heritage-gold/20 p-2">
            <div className="divide-y divide-heritage-gold/10">
              {recentPeople.map((person) => (
                <Link
                  key={person.id}
                  href={`/people`}
                  className="flex items-center gap-4 p-5 hover:bg-white/5 transition-all group rounded-xl"
                >
                  <div className="w-10 h-10 royal-halo bg-heritage-gold/10 text-lg font-bold text-heritage-gold shrink-0 transition-transform group-hover:scale-110">
                    {person.full_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-heritage-gold/90 group-hover:text-heritage-gold transition-colors">
                      {person.full_name}
                    </p>
                    <p className="text-xs text-heritage-gold-dim/60">
                      Đời {person.generation_level} ·{" "}
                      {person.gender === "male"
                        ? "Nam"
                        : person.gender === "female"
                          ? "Nữ"
                          : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-heritage-gold-dim/40 tracking-wider">
                    {getTimeAgo(person.updated_at)}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
