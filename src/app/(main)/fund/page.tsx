"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import { Wallet, Loader2, Download, FileText } from "lucide-react";
import { FundManagerTab } from "@/components/admin/fund-manager-tab";
import { FundDashboard } from "@/components/fund/fund-dashboard";
import { getFundSummary, getTopContributors, getAllTransactions } from "@/lib/fund-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function FundPage() {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportPDF = useCallback(async () => {
    if (!summary) return;
    setExportingPDF(true);
    try {
      const { generateFundPDF } = await import("@/lib/pdf-fund-generator");
      const { data: allTrx, error: trxErr } = await getAllTransactions();
      if (trxErr || !allTrx) throw new Error(trxErr || "Lỗi tải dữ liệu");

      const blob = await generateFundPDF(summary, allTrx);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_Cao_Thu_Chi_Quy_Toc_Tran_${new Date().getFullYear()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã tải xuống báo cáo tài chính!");
    } catch (err: any) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi xuất PDF: " + err.message);
    } finally {
      setExportingPDF(false);
    }
  }, [summary]);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) return setLoading(false);
      sb.from("profiles")
        .select("role, status")
        .eq("id", data.user.id)
        .single()
        .then(async ({ data: profile }) => {
          if (
            profile &&
            (profile.role === "accountant" || profile.role === "admin") &&
            profile.status === "approved"
          ) {
            setHasAccess(true);
            // Fetch Dashboard Data
            const [sumRes, topRes] = await Promise.all([
              getFundSummary(),
              getTopContributors(5),
            ]);
            if (sumRes.error) toast.error("Lỗi tải tổng quan quỹ: " + sumRes.error);
            if (topRes.error) toast.error("Lỗi tải top đóng góp: " + topRes.error);
            setSummary(sumRes.data);
            setTopContributors(topRes.data || []);
          }
          setLoading(false);
        });
    });
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl">🔒</div>
          <h2 className="text-lg font-bold">Không có quyền truy cập</h2>
          <p className="text-sm text-muted-foreground">
            Chỉ Thủ quỹ hoặc Admin mới có thể xem trang này
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 border-b border-border glass z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">Quỹ Họ</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quản lý thu chi quỹ dòng họ
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6 pb-20">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Dashboard Section */}
          {summary && (
            <FundDashboard summary={summary} topContributors={topContributors} />
          )}

          {/* Detailed Transaction Management */}
          <div className="pt-8 border-t border-dashed border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-serif text-[var(--color-heritage-gold)]">
                Lịch sử giao dịch chi tiết
              </h2>
              <Button
                size="sm"
                className="gold-gradient border-0 text-amber-950 font-semibold hover:opacity-90 gap-1.5 shadow-md flex items-center"
                onClick={handleExportPDF}
                disabled={exportingPDF || !summary}
              >
                {exportingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                Báo cáo PDF
              </Button>
            </div>
            <FundManagerTab />
          </div>
        </div>
      </div>
    </div>
  );
}
