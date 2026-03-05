"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Bell,
  Plus,
  Loader2,
  Search,
  MessageSquare,
  ThumbsUp,
  Share2,
  Calendar,
  Image as ImageIcon,
  MoreVertical,
} from "lucide-react";

import { FundTransaction, FundStats } from "@/lib/types";
import { FundDashboard } from "@/components/fund/fund-dashboard";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { addTransaction } from "@/lib/fund-actions";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function BoardPage() {
  const [contributions, setContributions] = useState<FundTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    member_id: "",
    amount: "",
    purpose: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    receipt_url: "",
  });

  const { isAdmin } = useAuth();
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb
      .from("funds")
      .select("*, members(full_name)")
      .order("transaction_date", { ascending: false });
    setContributions((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total_in = contributions.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      balance: total_in,
      totalIncome: total_in,
      totalExpense: 0,
      chartData: [],
    };
  }, [contributions]);

  const handleSave = async () => {
    if (!form.member_id || !form.amount) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("member_id", form.member_id);
      formData.append("amount", form.amount);
      formData.append("purpose", form.purpose);
      formData.append("notes", form.notes);
      formData.append("transaction_date", form.date);
      formData.append("transaction_type", "thu");

      const res = await addTransaction(formData);
      if (res.error) throw new Error(res.error);
      toast.success("Cảm ơn sự đóng góp của bạn!");
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const filtered = contributions.filter((c) =>
    (c as any).members?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-heritage-gold/10 glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center shadow-xl">
              <Bell className="w-5 h-5 text-heritage-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold royal-text-gradient leading-none">Bảng Tin Dòng Họ</h1>
              <p className="text-xs text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
                Thông tin, thông báo và đóng góp từ cộng đồng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-heritage-gold/60 hover:text-heritage-gold hover:bg-heritage-gold/10"
            >
              <Search className="w-5 h-5" />
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                className="gold-gradient border-0 text-amber-950 font-bold hover:opacity-90 gap-1.5 shadow-lg"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-4 h-4" /> Đóng góp
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Fund Dashboard Integration */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-heritage-gold/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-heritage-gold-dim">
                Quỹ Khuyến Học & Xây Dựng
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-heritage-gold/30" />
            </div>
            <FundDashboard summary={stats as any} topContributors={[]} />
          </section>

          {/* Social Feed Concept */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-heritage-gold/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-heritage-gold-dim">
                Tin Tức & Hoạt Động
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-heritage-gold/30" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Dummy Posts to demonstrate style */}
                {[1, 2].map((i) => (
                  <Card key={i} className="group hover:royal-gold-glow border-heritage-gold/10">
                    <CardHeader className="flex-row items-center gap-4 pb-4">
                      <div className="w-12 h-12 royal-halo overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-bold royal-text-gradient">Nguyễn Văn {i === 1 ? "Khoa" : "Dũng"}</h3>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-heritage-gold-dim/40 italic">
                          <Calendar className="w-3 h-3" /> {i === 1 ? "Hôm qua lúc 14:30" : "2 ngày trước"} · Công đức xây nhà thờ
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-heritage-gold/40 hover:text-heritage-gold">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-heritage-gold/80 leading-relaxed font-sans">
                        {i === 1
                          ? "Hôm nay gia đình tôi có dịp về thăm lại từ đường dòng họ Trần tại làng Mỹ Nguyên. Rất xúc động khi thấy con cháu tề tựu đông đủ để chuẩn bị cho lễ giỗ tổ sắp tới."
                          : "Đã hoàn thành việc tu bổ lại cổng chính của nhà thờ họ. Xin gửi hình ảnh để bà con ở xa cùng theo dõi tiến độ công trình ý nghĩa này của dòng họ chúng ta."}
                      </p>
                      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-heritage-gold/20 shadow-2xl group/img">
                        <img
                          src={i === 1 ? "/images/concept-3.png" : "/images/concept_3_starscape_1772696923905.png"}
                          alt="Post content"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-heritage-gold/5 flex justify-between">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="sm" className="gap-2 text-heritage-gold/60 hover:text-heritage-gold hover:bg-heritage-gold/10">
                          <ThumbsUp className="w-4 h-4" /> <span className="text-xs font-bold">12</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-heritage-gold/60 hover:text-heritage-gold hover:bg-heritage-gold/10">
                          <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold">5</span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2 text-heritage-gold/60 hover:text-heritage-gold hover:bg-heritage-gold/10">
                        <Share2 className="w-4 h-4" /> <span className="text-xs font-bold font-serif italic">Chia sẻ</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Sidebar Column */}
              <div className="space-y-8">
                <Card className="bg-heritage-maroon/20 border-heritage-gold/10 backdrop-blur-3xl overflow-visible">
                  <div className="absolute -top-3 -left-3 royal-halo w-10 h-10 bg-heritage-maroon border-heritage-gold flex items-center justify-center shadow-xl rotate-[-12deg]">
                    <Plus className="w-5 h-5 text-heritage-gold" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">Đóng góp mới</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contributions.slice(0, 5).map((c, i) => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-heritage-gold/5 transition-colors group cursor-pointer border border-transparent hover:border-heritage-gold/10">
                        <div className="w-9 h-9 royal-halo bg-heritage-gold/5 flex items-center justify-center shrink-0 group-hover:royal-gold-glow">
                          <span className="text-[10px] font-bold text-heritage-gold">#{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-heritage-gold truncate">{(c as any).members?.full_name}</p>
                          <p className="text-[10px] text-heritage-gold-dim truncate opacity-60 italic">{c.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-heritage-gold font-mono">+{c.amount.toLocaleString()}đ</p>
                          <p className="text-[9px] text-heritage-gold-dim opacity-40">{new Date(c.transaction_date).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-heritage-gold-dim hover:text-heritage-gold py-6">
                      Xem tất cả đóng góp
                    </Button>
                  </CardContent>
                </Card>

                {/* Community Stats */}
                <Card className="overflow-hidden border-orange-500/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] rounded-full" />
                  <CardHeader>
                    <CardTitle className="text-lg">Thống kê Quỹ</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1">
                      <p className="text-[10px] uppercase tracking-tighter text-heritage-gold-dim">Tổng thu</p>
                      <p className="text-lg font-serif font-bold text-heritage-gold">{stats.totalIncome.toLocaleString()}đ</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1">
                      <p className="text-[10px] uppercase tracking-tighter text-heritage-gold-dim">Dư quỹ</p>
                      <p className="text-lg font-serif font-bold text-green-500">{stats.balance.toLocaleString()}đ</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Contribution Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-royal-card border-heritage-gold/30">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl royal-text-gradient">Biểu mẫu công đức</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 custom-scrollbar max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-1.5 text-xs text-heritage-gold-dim italic mb-4 p-3 bg-heritage-gold/5 rounded-xl border border-heritage-gold/10">
              "Uống nước nhớ nguồn, ăn quả nhớ kẻ trồng cây. Công đức của quý vị góp phần hưng thịnh dòng tộc."
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Thành viên đóng góp *</Label>
              <Input
                placeholder="Tìm tên thành viên hoặc nhập mã..."
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                value={form.member_id}
                onChange={(e) => setForm((f) => ({ ...f, member_id: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Số tiền (VNĐ) *</Label>
                <Input
                  type="number"
                  placeholder="500000"
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Ngày đóng góp</Label>
                <Input
                  type="date"
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Mục đích</Label>
              <Input
                placeholder="Xây nhà thờ, khuyến học, v.v."
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                value={form.purpose}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Ghi chú</Label>
              <Textarea
                placeholder="Lời gắm gửi..."
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold min-h-[80px]"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Biên lai / Hình ảnh</Label>
              <ImageUpload
                bucket="media"
                value={form.receipt_url}
                onChange={(url) => setForm((f) => ({ ...f, receipt_url: url }))}
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-heritage-gold/10">
            <Button
              variant="ghost"
              className="text-heritage-gold hover:bg-heritage-gold/10 font-bold"
              onClick={() => setDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="gold-gradient border-0 text-amber-950 font-bold shadow-lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Hoàn tất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
