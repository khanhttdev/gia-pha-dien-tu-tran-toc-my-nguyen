"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Loader2,
  ArrowLeft,
  BarChart3,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  HeartPulse,
  Workflow,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLORS = ["#f59e0b", "#3b82f6", "#f43f5e", "#10b981", "#0ea5e9"];
const GENERATION_COLORS = [
  "#fcd34d",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
  "#b45309",
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    males: 0,
    females: 0,
    alive: 0,
    deceased: 0,
    byGen: [] as any[],
    ageGroups: [] as any[],
  });
  const [funds, setFunds] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const sb = createClient();
      const [membersRes, fundsRes] = await Promise.all([
        sb.from("members").select("gender, generation_level, metadata"),
        sb.from("funds").select("type, amount"),
      ]);

      const people = membersRes.data || [];
      const fundData = fundsRes.data || [];

      // Member Stats
      const maleCount = people.filter((p: any) => p.gender === "male").length;
      const femaleCount = people.filter(
        (p: any) => p.gender === "female",
      ).length;
      const aliveCount = people.filter(
        (p: any) => (p.metadata as any)?.is_alive !== false,
      ).length;

      // Generation Map
      const genMap: Record<number, number> = {};
      people.forEach((p: any) => {
        const g = p.generation_level || 1;
        genMap[g] = (genMap[g] || 0) + 1;
      });
      const byGen = Object.keys(genMap)
        .map((k) => ({
          name: `Đời ${k}`,
          count: genMap[parseInt(k)],
        }))
        .sort(
          (a, b) =>
            parseInt(a.name.split(" ")[1]) - parseInt(b.name.split(" ")[1]),
        );

      // Age Groups
      const currentYear = new Date().getFullYear();
      const ages = {
        "Trẻ em (0-17)": 0,
        "Thanh niên (18-35)": 0,
        "Trung niên (36-59)": 0,
        "Người cao tuổi (60+)": 0,
        "Chưa rõ": 0,
      };
      people.forEach((p: any) => {
        const meta = p.metadata as any;
        if (meta?.is_alive === false || !meta?.birth_year) {
          if (meta?.is_alive !== false) ages["Chưa rõ"]++;
          return;
        }
        const age = currentYear - meta.birth_year;
        if (age <= 17) ages["Trẻ em (0-17)"]++;
        else if (age <= 35) ages["Thanh niên (18-35)"]++;
        else if (age <= 59) ages["Trung niên (36-59)"]++;
        else ages["Người cao tuổi (60+)"]++;
      });
      const ageGroups = Object.keys(ages)
        .map((k) => ({ name: k, value: ages[k as keyof typeof ages] }))
        .filter((d) => d.value > 0);

      // Fund Stats
      let income = 0;
      let expense = 0;
      fundData.forEach((f: any) => {
        if (f.type === "income") income += f.amount;
        else if (f.type === "expense") expense += f.amount;
      });

      setStats({
        total: people.length,
        males: maleCount,
        females: femaleCount,
        alive: aliveCount,
        deceased: people.length - aliveCount,
        byGen,
        ageGroups,
      });
      setFunds({
        income,
        expense,
        balance: income - expense,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center gap-6 py-40">
        <Loader2 className="w-12 h-12 animate-spin text-heritage-gold" />
        <p className="text-heritage-gold-dim italic font-medium animate-pulse">
          Đang truy xuất sử thư và đối soát ngân quỹ...
        </p>
      </div>
    );
  }

  const genderData = [
    { name: "Nam", value: stats.males },
    { name: "Nữ", value: stats.females },
    { name: "Chưa rõ", value: stats.total - stats.males - stats.females },
  ].filter((d) => d.value > 0);

  const aliveData = [
    { name: "Còn sống", value: stats.alive },
    { name: "Đã mất", value: stats.deceased },
  ].filter((d) => d.value > 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div className="h-full flex flex-col p-6 space-y-10 overflow-y-auto custom-scrollbar w-full max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Link href="/admin">
          <Button
            aria-label="Quay lại"
            variant="outline"
            size="icon"
            className="h-10 w-10 border-heritage-gold/20 hover:bg-heritage-gold/10 text-heritage-gold rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold royal-text-gradient flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-heritage-gold" />
            Minh Bạch Gia Tộc
          </h1>
          <p className="text-sm text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
            Báo cáo chi tiết về nhân khẩu học và tài chính thời gian thực
          </p>
        </div>
      </div>

      {/* Fund Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-8 bg-royal-card border-emerald-500/20 shadow-2xl royal-glass hover:royal-gold-glow transition-all duration-500 group">
          <div className="flex items-center gap-4 text-emerald-400 mb-4">
            <div className="w-10 h-10 royal-halo bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Ngân Quỹ Hiện Có
            </span>
          </div>
          <div className="text-4xl font-serif font-black royal-text-gradient mt-2 tracking-tighter">
            {formatCurrency(funds.balance)}
          </div>
        </Card>

        <Card className="p-8 bg-royal-card border-heritage-gold/10 hover:border-heritage-gold/30 transition-all duration-300">
          <div className="flex items-center gap-4 text-blue-400 mb-4">
            <div className="w-10 h-10 royal-halo bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Sổ Thu (Công đức)
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-heritage-gold/90 mt-2">
            {formatCurrency(funds.income)}
          </div>
        </Card>

        <Card className="p-8 bg-royal-card border-heritage-gold/10 hover:border-heritage-gold/30 transition-all duration-300 shadow-xl">
          <div className="flex items-center gap-4 text-rose-400 mb-4">
            <div className="w-10 h-10 royal-halo bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Sổ Chi (Phụng sự)
            </span>
          </div>
          <div className="text-3xl font-serif font-bold text-heritage-gold/90 mt-2">
            {formatCurrency(funds.expense)}
          </div>
        </Card>
      </div>

      {/* People Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-10 bg-royal-card border-heritage-gold/30 flex flex-col justify-center items-center text-center royal-glass hover:royal-gold-glow transition-all duration-500 group">
          <div className="text-xs font-black text-heritage-gold-dim uppercase tracking-[0.3em] mb-4 opacity-70">
            Tổng số nhân khẩu
          </div>
          <div className="text-7xl font-serif font-black royal-text-gradient group-hover:scale-105 transition-transform duration-700">
            {stats.total}
          </div>
          <p className="text-[10px] text-heritage-gold-dim/40 mt-4 flex items-center gap-2 font-bold uppercase tracking-widest italic">
            <Clock className="w-3.5 h-3.5 text-heritage-gold/30" />
            Cập nhật: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </Card>

        <Card className="p-8 bg-royal-card border-heritage-gold/10 flex flex-col items-center transition-all duration-300 hover:bg-black/40">
          <h3 className="text-[10px] font-black text-heritage-gold-dim/60 uppercase tracking-[0.2em] mb-6 w-full text-center">
            Cơ cấu giới tính
          </h3>
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                  paddingAngle={6}
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1a0a0a",
                    border: "1px solid rgba(234, 179, 8, 0.2)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                  }}
                  itemStyle={{ color: "#eab308", fontWeight: "bold", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Users className="w-6 h-6 text-heritage-gold/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-heritage-gold/60">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span> Nam (
              {Math.round((stats.males / stats.total) * 100)}%)
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-heritage-gold/60">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></span> Nữ (
              {Math.round((stats.females / stats.total) * 100)}%)
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-royal-card border-heritage-gold/10 flex flex-col items-center transition-all duration-300 hover:bg-black/40">
          <h3 className="text-[10px] font-black text-heritage-gold-dim/60 uppercase tracking-[0.2em] mb-6 w-full text-center">
            Sinh khí dòng tộc
          </h3>
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aliveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                  paddingAngle={6}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#64748b" />
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1a0a0a",
                    border: "1px solid rgba(234, 179, 8, 0.2)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#eab308", fontWeight: "bold", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <HeartPulse className="w-6 h-6 text-heritage-gold/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-heritage-gold/60">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>{" "}
              Hiện hữu
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-heritage-gold/60">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.4)]"></span> Đã khuất
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        <Card className="p-10 bg-royal-card border-heritage-gold/10 h-[420px] flex flex-col transition-all duration-500 hover:border-heritage-gold/30">
          <h3 className="text-xs font-bold mb-10 flex items-center gap-3 text-heritage-gold-dim uppercase tracking-[0.2em] shrink-0">
            <div className="w-1.5 h-7 rounded-full bg-heritage-gold shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div> Phân bổ
            theo kế thế (Thế hệ)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.byGen}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#eab30866"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  dy={15}
                />
                <YAxis
                  stroke="#eab30866"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(234,179,8,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#1a0a0a",
                    border: "1px solid rgba(234,179,8,0.2)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#eab308", fontWeight: "bold", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Số nhân khẩu" radius={[8, 8, 0, 0]}>
                  {stats.byGen.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENERATION_COLORS[index % GENERATION_COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-10 bg-royal-card border-heritage-gold/10 h-[420px] flex flex-col transition-all duration-500 hover:border-heritage-gold/30">
          <h3 className="text-xs font-bold mb-10 flex items-center gap-3 text-heritage-gold-dim uppercase tracking-[0.2em] shrink-0">
            <div className="w-1.5 h-7 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> Cấu trúc độ
            tuổi (Phần tử hiện sống)
          </h3>
          <div className="flex-1 w-full min-h-0 flex items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.ageGroups}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                  paddingAngle={5}
                  label={({
                    cx,
                    cy,
                    midAngle = 0,
                    innerRadius,
                    outerRadius,
                    value,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                        fontWeight="black"
                        className="pointer-events-none drop-shadow-md"
                      >
                        {value}
                      </text>
                    );
                  }}
                >
                  {stats.ageGroups.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1a0a0a",
                    border: "1px solid rgba(234, 179, 8, 0.2)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#60a5fa", fontWeight: "bold", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <Workflow className="w-12 h-12 text-heritage-gold" />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8 shrink-0">
            {stats.ageGroups.map((group, index) => (
              <div
                key={group.name}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-heritage-gold/5 border border-heritage-gold/10"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 8px ${COLORS[index % COLORS.length]}` }}
                ></span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-heritage-gold-dim opacity-80">{group.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
