"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Wallet, Medal, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

// Local currency formatter
const formatCurrency = (val: number | undefined) => {
    if (typeof val !== "number") return "0";
    return new Intl.NumberFormat("vi-VN").format(val);
};

interface FundSummaryData {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    chartData: { month: string; income: number; expense: number }[];
}

interface Contributor {
    id: string;
    name: string;
    amount: number;
}

interface FundDashboardProps {
    summary: FundSummaryData;
    topContributors: Contributor[];
}

export function FundDashboard({ summary, topContributors }: FundDashboardProps) {
    // Add a generic 'Total' tooltip formatter
    const formatTooltip = (value: any) => [
        formatCurrency(value as number) + " VNĐ",
        "",
    ] as any;

    return (
        <div className="space-y-10">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-royal-card border-emerald-500/20 p-8 rounded-[2rem] royal-glass hover:royal-gold-glow transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                        <TrendingUp className="w-24 h-24 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Tổng Công Đức (Thu)
                    </p>
                    <p className="text-3xl font-serif font-black text-emerald-400 group-hover:tracking-tight transition-all">
                        {formatCurrency(summary.totalIncome)}
                    </p>
                    <p className="text-[9px] text-emerald-500/40 mt-3 font-bold uppercase tracking-widest italic">Tích lũy qua các đời</p>
                </Card>

                <Card className="bg-royal-card border-rose-500/20 p-8 rounded-[2rem] royal-glass hover:royal-gold-glow transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                        <TrendingDown className="w-24 h-24 text-rose-500" />
                    </div>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        Tổng Phụng Sự (Chi)
                    </p>
                    <p className="text-3xl font-serif font-black text-rose-400">
                        {formatCurrency(summary.totalExpense)}
                    </p>
                    <p className="text-[9px] text-rose-500/40 mt-3 font-bold uppercase tracking-widest italic">Hương hỏa & Việc hiếu hỉ</p>
                </Card>

                <Card className="bg-royal-card border-heritage-gold/30 p-8 rounded-[2rem] royal-glass hover:royal-gold-glow shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 group relative overflow-hidden border-2">
                    <div className="absolute -right-4 -top-4 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <Wallet className="w-24 h-24 text-heritage-gold" />
                    </div>
                    <p className="text-[10px] font-bold text-heritage-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Wallet className="w-3.5 h-3.5" />
                        Tồn Quỹ Hiện Tại
                    </p>
                    <p className="text-4xl font-serif font-black royal-text-gradient">
                        {formatCurrency(summary.balance)}
                    </p>
                    <p className="text-[9px] text-heritage-gold-dim/40 mt-3 font-bold uppercase tracking-widest italic">Ngân lượng khởi tạo thịnh hưng</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <Card className="lg:col-span-2 bg-royal-card border-heritage-gold/10 p-10 rounded-[2.5rem] royal-glass hover:border-heritage-gold/30 transition-all duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-bold royal-text-gradient uppercase tracking-[0.2em]">
                            Biểu Đồ Tài Chính Theo Kỳ
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span> Thu
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]"></span> Chi
                            </div>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={summary.chartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <XAxis
                                    dataKey="month"
                                    stroke="#eab30833"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#eab30833"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(234,179,8,0.03)" }}
                                    contentStyle={{
                                        backgroundColor: "#1a0a0a",
                                        border: "1px solid rgba(234, 179, 8, 0.2)",
                                        borderRadius: "16px",
                                        boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
                                    }}
                                    itemStyle={{ color: "#eab308", fontWeight: "bold", fontSize: "12px" }}
                                    formatter={formatTooltip}
                                />
                                <Bar dataKey="income" name="Thu" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32}>
                                    {summary.chartData.map((entry, index) => (
                                        <Cell key={`income-${index}`} className="hover:opacity-80 transition-opacity" />
                                    ))}
                                </Bar>
                                <Bar dataKey="expense" name="Chi" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32}>
                                    {summary.chartData.map((entry, index) => (
                                        <Cell key={`expense-${index}`} className="hover:opacity-80 transition-opacity" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Contributors */}
                <Card className="bg-royal-card border-heritage-gold/10 p-10 rounded-[2.5rem] royal-glass hover:border-heritage-gold/30 transition-all duration-500">
                    <h3 className="text-sm font-bold mb-10 flex items-center gap-3 text-heritage-gold uppercase tracking-[0.2em]">
                        <Medal className="w-5 h-5 text-heritage-gold" />
                        Bảng Vàng Đóng Góp
                    </h3>
                    <div className="space-y-4">
                        {topContributors.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center gap-4">
                                <Users className="w-10 h-10 text-heritage-gold/10" />
                                <p className="text-[10px] text-heritage-gold-dim italic font-medium opacity-40 uppercase tracking-widest">
                                    Chưa có dữ liệu vinh danh
                                </p>
                            </div>
                        ) : (
                            topContributors.map((c, idx) => (
                                <div key={c.id} className="group flex items-center justify-between p-4 rounded-2xl border border-heritage-gold/5 bg-black/20 hover:bg-heritage-gold/5 hover:border-heritage-gold/20 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg transition-transform group-hover:scale-110",
                                            idx === 0 ? "bg-heritage-gold text-amber-950 shadow-heritage-gold/20" :
                                                idx === 1 ? "bg-slate-400 text-slate-950 shadow-slate-400/20" :
                                                    idx === 2 ? "bg-orange-800 text-orange-50 shadow-orange-800/20" : "bg-black/40 text-heritage-gold/40 border border-heritage-gold/10"
                                        )}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-serif font-bold text-heritage-gold-dim group-hover:text-heritage-gold transition-colors">{c.name}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-heritage-gold-dim/30 mt-0.5 italic">Hậu duệ</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-serif font-black text-emerald-400 group-hover:scale-105 transition-transform">
                                        +{formatCurrency(c.amount)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
