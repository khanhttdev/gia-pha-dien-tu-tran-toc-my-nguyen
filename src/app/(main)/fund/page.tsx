"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, Loader2, FileText } from "lucide-react";
import { FundManagerTab } from "@/components/admin/fund-manager-tab";
import { FundDashboard } from "@/components/fund/fund-dashboard";
import { getAllTransactions } from "@/lib/fund-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore, useFundStore } from "@/lib/stores";

export default function FundPage() {
  // ─── Stores ──────────────────────────────────────────────────────────────────
  const authStatus = useAuthStore((s) => s.status);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isAccountant = useAuthStore((s) => s.isAccountant);
  const initializeAuth = useAuthStore((s) => s.initialize);

  const fundStatus = useFundStore((s) => s.status);
  const summary = useFundStore((s) => s.summary);
  const topContributors = useFundStore((s) => s.topContributors);
  const fetchDashboard = useFundStore((s) => s.fetchDashboard);

  // ─── Local state ──────────────────────────────────────────────────────────────
  const [exportingPDF, setExportingPDF] = useState(false);

  const hasAccess = isAdmin || isAccountant;
  const loading = authStatus === "idle" || authStatus === "loading" || fundStatus === "loading";

  // Initialize auth & fund data
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (authStatus === "authenticated" && hasAccess) {
      fetchDashboard();
    }
  }, [authStatus, hasAccess, fetchDashboard]);

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
