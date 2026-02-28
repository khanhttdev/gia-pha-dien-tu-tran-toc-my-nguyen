"use client";

import { useEffect, useState } from "react";
import { getDemographicStats } from "@/lib/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, HeartPulse, Workflow, Activity } from "lucide-react";

export function AnalyticsTab() {
  const [stats, setStats] = useState<any>(null);
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
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats)
    return (
      <div className="p-4 text-center text-muted-foreground cursor-default">
        Không thể tải dữ liệu thống kê
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-amber-500/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng nhân khẩu
            </CardTitle>
            <Users className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đã ghi nhận trong gia phả
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tỉ lệ Giới tính
            </CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {stats.male} Nam / {stats.female} Nữ
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.male / (stats.total || 1)) * 100).toFixed(1)}% là Nam
              giới
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trạng thái
            </CardTitle>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">
              {stats.alive} Đang sống
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.deceased} người đã khuất
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số Đời (Thế hệ)
            </CardTitle>
            <Workflow className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {Object.keys(stats.generations).length} thế hệ
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-truncate">
              Ghi nhận từ F1 đến F
              {Math.max(...Object.keys(stats.generations).map(Number))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phân bố theo thế hệ (Simple Bar Chart Visualization using Tailwind) */}
      <Card className="glass border-border/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Bản đồ Thế hệ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.generations)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([gen, count]: any) => {
                const percentage = (count / stats.total) * 100;
                return (
                  <div key={gen} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">
                        Thế hệ {gen}
                      </span>
                      <span className="font-bold">{count} người</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
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
