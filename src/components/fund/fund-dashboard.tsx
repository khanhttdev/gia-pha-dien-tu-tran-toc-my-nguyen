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
} from "recharts";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Wallet, Medal } from "lucide-react";

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
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ArrowUpRight className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        Tổng Thu
                    </p>
                    <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(summary.totalIncome)}
                    </p>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ArrowDownRight className="w-16 h-16 text-rose-500" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ArrowDownRight className="w-4 h-4 text-rose-500" />
                        Tổng Chi
                    </p>
                    <p className="text-2xl font-bold mt-2 text-rose-600 dark:text-rose-400">
                        {formatCurrency(summary.totalExpense)}
                    </p>
                </div>

                <div className="glass p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-16 h-16 text-amber-500" />
                    </div>
                    <p className="text-sm font-medium text-amber-700/70 dark:text-amber-400/70 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-amber-600" />
                        Tồn Quỹ Hiện Tại
                    </p>
                    <p className="text-2xl font-bold mt-2 text-amber-700 dark:text-amber-400">
                        {formatCurrency(summary.balance)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold mb-6 text-[var(--color-heritage-gold)]">
                        Biểu Đồ Thu Chi Theo Tháng
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={summary.chartData}
                                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#6b7280" }}
                                    dy={10}
                                />
                                <YAxis
                                    hide
                                    domain={[0, 'auto']}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                                    contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    formatter={formatTooltip}
                                />
                                <Bar dataKey="income" name="Thu" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="expense" name="Chi" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Contributors */}
                <div className="glass p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[var(--color-heritage-gold)]">
                        <Medal className="w-5 h-5 text-amber-500" />
                        Top Đóng Góp
                    </h3>
                    <div className="space-y-4">
                        {topContributors.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-8">
                                Chưa có dữ liệu đóng góp
                            </p>
                        ) : (
                            topContributors.map((c, idx) => (
                                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm",
                                            idx === 0 ? "bg-amber-400" :
                                                idx === 1 ? "bg-slate-400" :
                                                    idx === 2 ? "bg-orange-700" : "bg-primary/20 text-primary"
                                        )}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{c.name}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        +{formatCurrency(c.amount)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
