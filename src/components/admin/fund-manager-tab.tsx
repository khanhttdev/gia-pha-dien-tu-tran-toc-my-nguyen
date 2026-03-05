"use client";

import { useState, useEffect } from "react";
import {
  getFunds,
  addTransaction,
  deleteTransaction,
  getFundBalance,
  updateTransaction,
} from "@/lib/fund-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  ChevronDown,
  Edit2,
  Wallet,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface FundTransaction {
  id: string;
  transaction_type: "income" | "expense" | string;
  amount: number;
  description: string;
  transaction_date: string;
  member?: { id: string; full_name: string } | null;
}

export function FundManagerTab() {
  const [funds, setFunds] = useState<FundTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);

  // form add
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // form edit
  const [editingTx, setEditingTx] = useState<any>(null);
  const [editType, setEditType] = useState("income");
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async (cursor?: string, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    const [resFunds, resBal] = await Promise.all([
      getFunds(cursor, 20),
      append
        ? Promise.resolve({ error: null, balance: balance })
        : getFundBalance(),
    ]);

    if (resFunds.data) {
      setFunds((prev) =>
        append
          ? [...prev, ...(resFunds.data as FundTransaction[])]
          : (resFunds.data as FundTransaction[]),
      );
      setHasMore(resFunds.hasMore);
      setNextCursor(resFunds.nextCursor);
    }
    if (!append && !resBal.error) setBalance((resBal as any).balance);

    if (append) setLoadingMore(false);
    else setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc)
      return toast.error("Vui lòng nhập đủ số tiền và lý do");

    setIsAdding(true);
    const formData = new FormData();
    formData.append("transaction_type", type);
    formData.append("amount", amount.replace(/,/g, ""));
    formData.append("description", desc);
    formData.append("transaction_date", date);

    const res = await addTransaction(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Đã ghi nhận giao dịch thành công");
      setAmount("");
      setDesc("");
      await load();
    }
    setIsAdding(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteTransaction(deletingId);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Đã xóa giao dịch khỏi sổ sách");
      setDeletingId(null);
      load();
    }
  };

  const startEdit = (tx: any) => {
    setEditingTx(tx);
    setEditType(tx.transaction_type);
    setEditAmount(tx.amount.toString());
    setEditDesc(tx.description);
    setEditDate(new Date(tx.transaction_date).toISOString().split("T")[0]);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAmount || !editDesc)
      return toast.error("Vui lòng nhập đủ thông tin yêu cầu");

    setIsUpdating(true);
    const formData = new FormData();
    formData.append("transaction_type", editType);
    formData.append("amount", editAmount.replace(/,/g, ""));
    formData.append("description", editDesc);
    formData.append("transaction_date", editDate);

    const res = await updateTransaction(editingTx.id, formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Cập nhật giao dịch thành công");
      setEditingTx(null);
      await load();
    }
    setIsUpdating(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-heritage-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Balance Section */}
      <section className="flex flex-col items-center">
        <Card className="w-full max-w-2xl bg-royal-card border-heritage-gold/20 p-10 royal-glass hover:royal-gold-glow transition-all duration-500 text-center space-y-4">
          <div className="w-16 h-16 royal-halo bg-heritage-gold/5 flex items-center justify-center mx-auto mb-2">
            <Wallet className="w-8 h-8 text-heritage-gold" />
          </div>
          <h3 className="text-[11px] font-bold text-heritage-gold-dim uppercase tracking-[0.3em] px-4 py-1.5 bg-heritage-maroon/20 border border-heritage-gold/10 rounded-full inline-block">
            Tổng Ngân Quỹ Gia Tộc
          </h3>
          <p
            className={cn(
              "text-5xl font-serif font-black tracking-tight",
              balance >= 0 ? "royal-text-gradient" : "text-red-500",
            )}
          >
            {formatCurrency(balance)}
          </p>
          <p className="text-[10px] text-heritage-gold-dim/40 italic font-medium">Báo cáo cập nhật thời gian thực dựa trên sổ sách điện tử</p>
        </Card>
      </section>

      {/* Transaction Form Card */}
      <Card className="bg-heritage-maroon/10 border-heritage-gold/10 p-8 royal-glass">
        <div className="flex items-center gap-2 mb-8 px-1">
          <Plus className="w-4 h-4 text-heritage-gold" />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-heritage-gold">Ghi nhận giao dịch mới</h3>
        </div>
        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end"
        >
          <div className="space-y-2">
            <Label className="text-[9px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Phân loại</Label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl px-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm appearance-none cursor-pointer"
              >
                <option value="income" className="bg-royal-maroon-dark">Thu vào (+)</option>
                <option value="expense" className="bg-royal-maroon-dark">Chi ra (-)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-heritage-gold/40">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label className="text-[9px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Ngân Lượng (VNĐ)</Label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                placeholder="0"
                className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl pl-10 pr-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm transition-all"
              />
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-gold/40" />
            </div>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label className="text-[9px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Diễn giải / Lý do</Label>
            <div className="relative">
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                placeholder="Ví dụ: Đóng quỹ đinh năm 2026..."
                className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl pl-10 pr-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm transition-all italic"
              />
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-gold/40" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Kỳ chốt sổ</Label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl pl-10 pr-10 text-heritage-gold focus:border-heritage-gold/50 outline-none text-xs transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-gold/40" />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isAdding}
            className="h-11 bg-heritage-gold hover:bg-heritage-gold/90 text-amber-950 font-bold rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isAdding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm Giao Dịch
              </span>
            )}
          </Button>
        </form>
      </Card>

      {/* Transaction History */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-heritage-gold" />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-heritage-gold-dim">Lịch sử Giao dịch Ngân quỹ</h3>
          </div>
        </div>

        {funds.length === 0 ? (
          <div className="text-center py-20 bg-royal-card/20 border border-dashed border-heritage-gold/10 rounded-[3rem]">
            <Wallet className="w-12 h-12 text-heritage-gold/10 mx-auto mb-4" />
            <p className="text-heritage-gold-dim italic font-medium">Chưa có giao dịch nào được ghi nhận trong sổ sách.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {funds.map((f: any) => (
              <div
                key={f.id}
                className="group bg-royal-card/40 hover:bg-royal-card/80 border border-heritage-gold/10 hover:border-heritage-gold/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "w-12 h-12 royal-halo flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-lg",
                      f.transaction_type === "income"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-500",
                    )}
                  >
                    {f.transaction_type === "income" ? (
                      <ArrowDownRight className="w-6 h-6" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-sm font-bold text-heritage-gold group-hover:tracking-wide transition-all truncate">
                      {f.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-heritage-gold/10">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-heritage-gold-dim/40 italic">
                        <Calendar className="w-3 h-3" />
                        {new Date(f.transaction_date).toLocaleDateString("vi-VN")}
                      </div>
                      {f.member && (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold uppercase tracking-tighter border-heritage-gold/20 text-heritage-gold/60 py-0.5 bg-heritage-gold/5"
                        >
                          {f.member.full_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-heritage-gold/5 sm:border-0 sm:pt-0">
                  <span
                    className={cn(
                      "text-xl font-serif font-black tracking-tight mr-2",
                      f.transaction_type === "income"
                        ? "text-emerald-400"
                        : "text-red-500",
                    )}
                  >
                    {f.transaction_type === "income" ? "+" : "-"}
                    {formatCurrency(f.amount)}
                  </span>

                  <div className="flex items-center gap-2 border-l border-heritage-gold/10 pl-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-heritage-gold/40 hover:text-heritage-gold hover:bg-heritage-gold/10 rounded-full transition-all"
                      onClick={() => startEdit(f)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                      onClick={() => setDeletingId(f.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => load(nextCursor, true)}
                  disabled={loadingMore}
                  className="h-10 px-8 rounded-full font-bold uppercase tracking-widest text-[10px] text-heritage-gold border-heritage-gold/20 bg-heritage-maroon/20 hover:bg-heritage-gold hover:text-amber-950 transition-all shadow-xl"
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  )}
                  {loadingMore ? "Đang truy xuất..." : "Tải thêm trang cũ"}
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Dialog Edit */}
      <Dialog open={!!editingTx} onOpenChange={(o) => !o && setEditingTx(null)}>
        <DialogContent className="sm:max-w-[480px] bg-royal-card border-heritage-gold/30 p-8 royal-glass">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-serif font-bold royal-text-gradient">Chỉnh sửa Bản ghi Quỹ</DialogTitle>
            <DialogDescription className="text-xs text-heritage-gold-dim italic font-medium">
              Lưu ý: Mọi chỉnh sửa sẽ được lưu vết vào nhật ký kiểm toán hệ thống để minh bạch tài chính.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Loại giao dịch</Label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl px-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm appearance-none"
              >
                <option value="income" className="bg-royal-maroon-dark">Thu vào (+)</option>
                <option value="expense" className="bg-royal-maroon-dark">Chi ra (-)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Số tiền (VNĐ)</Label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
                min="0"
                className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl px-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Mô tả lý do</Label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                required
                className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl px-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm italic"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Ngày chứng từ</Label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
                className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl px-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-heritage-gold/10">
              <Button
                type="button"
                variant="ghost"
                className="text-heritage-gold-dim hover:text-heritage-gold hover:bg-heritage-gold/5"
                onClick={() => setEditingTx(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-heritage-gold hover:bg-heritage-gold/90 text-amber-950 font-bold min-w-[140px] shadow-xl"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Cập Nhật Sổ Sách"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Delete */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent className="bg-royal-card border-red-500/30 p-8 royal-glass">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-serif font-bold text-red-500">Thu hồi Giao dịch?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-heritage-gold-dim italic font-medium">
              Hành động này sẽ gỡ bỏ bản ghi vĩnh viễn khỏi sổ sách. Số dư ngân quỹ sẽ được tính toán lại tự động. Hành động này sẽ được ghi vào nhật ký bảo mật.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="border-heritage-gold/20 text-heritage-gold-dim hover:text-heritage-gold hover:bg-heritage-gold/5">Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-xl"
            >
              Chấp nhận gỡ bỏ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
