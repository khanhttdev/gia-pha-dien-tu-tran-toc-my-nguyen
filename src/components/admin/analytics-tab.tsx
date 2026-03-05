"use client";

import { useEffect, useState } from "react";
import { getDemographicStats } from "@/lib/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, HeartPulse, Workflow, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemographicStats {
  total: number;
  male: number;
  female: number;
  alive: number;
  deceased: number;
  generations: Record<string, number>;
}

export function AnalyticsTab() {
  const [stats, setStats] = useState<DemographicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getDemographicStats();
      if (!res.error && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-heritage-gold" />
      </div>
    );
  }

  if (!stats)
    return (
      <div className="p-12 text-center text-heritage-gold-dim italic font-medium cursor-default royal-glass rounded-[2rem] border border-heritage-gold/10">
        Không thể tải dữ liệu thống kê gia tộc. Vui lòng thử lại sau.
      </div>
    );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-royal-card border-heritage-gold/20 hover:royal-gold-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-gold-dim">
              Tổng nhân khẩu
            </CardTitle>
            <div className="w-8 h-8 royal-halo bg-heritage-gold/5 flex items-center justify-center">
              <Users className="w-4 h-4 text-heritage-gold" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold royal-text-gradient">
              {stats.total}
            </div>
            <p className="text-[10px] text-heritage-gold-dim/60 mt-1 font-medium italic">
              Đã ghi nhận trong sử sách gia tộc
            </p>
          </CardContent>
        </Card>

        <Card className="bg-royal-card border-heritage-gold/10 hover:border-heritage-gold/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-gold-dim">
              Tỉ lệ Giới tính
            </CardTitle>
            <div className="w-8 h-8 royal-halo bg-emerald-500/5 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-emerald-400">
              {stats.male} Nam / {stats.female} Nữ
            </div>
            <p className="text-[10px] text-heritage-gold-dim/60 mt-1 font-medium italic">
              {((stats.male / (stats.total || 1)) * 100).toFixed(1)}% là Nam duệ
            </p>
          </CardContent>
        </Card>

        <Card className="bg-royal-card border-heritage-gold/10 hover:border-heritage-gold/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-gold-dim">
              Trạng thái
            </CardTitle>
            <div className="w-8 h-8 royal-halo bg-rose-500/5 flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-rose-400">
              {stats.alive} Hiện hữu
            </div>
            <p className="text-[10px] text-heritage-gold-dim/60 mt-1 font-medium italic">
              {stats.deceased} người đã về cội nguồn
            </p>
          </CardContent>
        </Card>

        <Card className="bg-royal-card border-heritage-gold/10 hover:border-heritage-gold/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-heritage-gold-dim">
              Số Đời (Thế hệ)
            </CardTitle>
            <div className="w-8 h-8 royal-halo bg-blue-500/5 flex items-center justify-center">
              <Workflow className="w-4 h-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-blue-400">
              {Object.keys(stats.generations).length} thế hệ
            </div>
            <p className="text-[10px] text-heritage-gold-dim/60 mt-1 font-medium italic truncate">
              Ghi từ F1 đến F
              {Math.max(...Object.keys(stats.generations).map(Number))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generation History Map */}
      <Card className="bg-royal-card border-heritage-gold/20 p-8 royal-glass hover:royal-gold-glow transition-all duration-500">
        <CardHeader className="px-0 pt-0 pb-8 flex flex-row items-center gap-4">
          <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center">
            <Workflow className="w-5 h-5 text-heritage-gold" />
          </div>
          <div>
            <CardTitle className="text-lg font-serif font-bold royal-text-gradient">Bản Đồ Phân Bổ Thế Hệ</CardTitle>
            <p className="text-[10px] text-heritage-gold-dim uppercase tracking-widest opacity-60">Sự phát triển của dòng tộc qua các đời</p>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {Object.entries(stats.generations)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([gen, count]: any) => {
                const percentage = (count / stats.total) * 100;
                return (
                  <div key={gen} className="group space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold uppercase tracking-widest text-heritage-gold/60 group-hover:text-heritage-gold transition-colors">
                        Đời thứ {gen}
                      </span>
                      <span className="text-sm font-serif font-black text-heritage-gold">{count} <span className="text-[9px] font-sans font-bold text-heritage-gold-dim tracking-tighter uppercase ml-1">Nhân khẩu</span></span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full border border-heritage-gold/10 overflow-hidden p-[1px]">
                      <div
                        className="h-full bg-heritage-gold rounded-full shadow-[0_0_8px_rgba(234,179,8,0.4)] group-hover:shadow-[0_0_12px_rgba(234,179,8,0.6)] transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
