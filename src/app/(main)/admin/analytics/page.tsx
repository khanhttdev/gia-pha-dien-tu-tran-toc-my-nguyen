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
  Tooltip,
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      <div className="flex justify-center flex-col items-center gap-4 py-32">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-muted-foreground animate-pulse">
          Đang tải dữ liệu gia phả...
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
    <div className="h-full flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button
            aria-label="Quay lại"
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border/50 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            Thống kê Tổng quan Gia Phả
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Báo cáo thời gian thực về nhân sự và tài chính
          </p>
        </div>
      </div>

      {/* Fund Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 glow-effect">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">
              Tổng Quỹ Hiện Có
            </span>
          </div>
          <div className="text-3xl font-black bg-gradient-to-br from-emerald-300 to-emerald-600 bg-clip-text text-transparent mt-2">
            {formatCurrency(funds.balance)}
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-blue-500/20">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">
              Tổng Thu
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(funds.income)}
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-rose-500/20">
          <div className="flex items-center gap-3 text-rose-500 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">
              Tổng Chi
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(funds.expense)}
          </div>
        </div>
      </div>

      {/* People Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Tổng số nhân khẩu
          </div>
          <div className="text-6xl font-black bg-gradient-to-br from-amber-200 to-amber-600 bg-clip-text text-transparent">
            {stats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Tính đến hôm nay
          </p>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center">
          <h3 className="text-sm font-bold text-muted-foreground mb-4 w-full text-center">
            Tỷ lệ Giới tính
          </h3>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                  paddingAngle={4}
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} người`, "Số lượng"]}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fcd34d" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-xs font-semibold mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> Nam (
              {Math.round((stats.males / stats.total) * 100)}%)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Nữ (
              {Math.round((stats.females / stats.total) * 100)}%)
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center">
          <h3 className="text-sm font-bold text-muted-foreground mb-4 w-full text-center">
            Tình trạng Sự sống
          </h3>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aliveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                  paddingAngle={4}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#64748b" />
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} người`, "Số lượng"]}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fcd34d" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-xs font-semibold mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>{" "}
              Còn sống
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-500"></span> Đã mất
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-12">
        <div className="glass p-6 rounded-2xl border border-border/50 h-[380px] flex flex-col">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-muted-foreground uppercase tracking-widest shrink-0">
            <div className="w-2 h-6 rounded-full bg-amber-500"></div> Phân bố
            theo thế hệ (Đời)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.byGen}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "border: 1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#fcd34d" }}
                />
                <Bar dataKey="count" name="Số người" radius={[6, 6, 0, 0]}>
                  {stats.byGen.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENERATION_COLORS[index % GENERATION_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 h-[380px] flex flex-col">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-muted-foreground uppercase tracking-widest shrink-0">
            <div className="w-2 h-6 rounded-full bg-blue-500"></div> Cấu trúc độ
            tuổi (Người còn sống)
          </h3>
          <div className="flex-1 w-full min-h-0 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.ageGroups}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                  paddingAngle={4}
                  label={({
                    cx,
                    cy,
                    midAngle = 0,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
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
                        fontSize={12}
                        fontWeight="bold"
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
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} người`, "Số lượng"]}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#60a5fa" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold mt-4 shrink-0">
            {stats.ageGroups.map((group, index) => (
              <div
                key={group.name}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                {group.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
