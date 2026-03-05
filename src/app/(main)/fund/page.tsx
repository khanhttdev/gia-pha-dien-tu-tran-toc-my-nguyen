"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, Loader2, FileText, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { FundManagerTab } from "@/components/admin/fund-manager-tab";
import { FundDashboard } from "@/components/fund/fund-dashboard";
import { getAllTransactions } from "@/lib/fund-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore, useFundStore } from "@/lib/stores";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <div className="h-full flex flex-col items-center justify-center gap-6 py-40">
        <Loader2 className="w-12 h-12 animate-spin text-heritage-gold" />
        <p className="text-heritage-gold-dim italic font-medium animate-pulse">
          Đang quyết toán ngân quỹ gia tộc...
        </p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-md w-full royal-glass border border-red-500/20 rounded-[2rem] p-12 text-center space-y-6">
          <div className="w-20 h-20 royal-halo-pink bg-red-500/5 flex items-center justify-center mx-auto">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-red-400">Không có quyền truy cập</h2>
          <p className="text-sm text-heritage-gold-dim italic font-medium">
            Khu vực này chỉ dành cho Thủ quỹ hoặc Quản trị viên cao cấp của gia tộc. Vui lòng liên hệ ban quản trị nếu bạn cho rằng đây là một sự nhầm lẫn.
          </p>
          <Link href="/home">
            <Button variant="outline" className="mt-4 border-heritage-gold/20 text-heritage-gold hover:bg-heritage-gold/10 rounded-full px-8">
              Quay lại Trang Chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar page-enter">
      {/* Header */}
      <div className="shrink-0 px-8 py-6 border-b border-heritage-gold/10 royal-glass z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 royal-halo bg-heritage-gold/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-heritage-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold royal-text-gradient">Ngân Quỹ Gia Tộc</h1>
              <p className="text-[10px] text-heritage-gold-dim uppercase tracking-[0.2em] font-bold opacity-60">Minh bạch tài chính - Phụng sự tổ tiên</p>
            </div>
          </div>

          <Button
            size="sm"
            className="gold-gradient text-amber-950 font-black gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-widest px-6 h-11 rounded-xl"
            onClick={handleExportPDF}
            disabled={exportingPDF || !summary}
          >
            {exportingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Xuất Báo Cáo PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full px-4 sm:px-8 py-10 pb-20">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Dashboard Section */}
          {summary && (
            <FundDashboard summary={summary} topContributors={topContributors} />
          )}

          {/* Detailed Transaction Management */}
          <div className="pt-16 border-t border-dashed border-heritage-gold/10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1.5 h-8 rounded-full bg-heritage-gold shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
              <div>
                <h2 className="text-xl font-serif font-bold text-heritage-gold uppercase tracking-wide">
                  Sổ Sách Chi Tiết
                </h2>
                <p className="text-[10px] text-heritage-gold-dim italic font-medium">Đối soát mọi giao dịch thu chi trong lịch sử</p>
              </div>
            </div>
            <FundManagerTab />
          </div>
        </div>
      </div>
    </div>
  );
}
