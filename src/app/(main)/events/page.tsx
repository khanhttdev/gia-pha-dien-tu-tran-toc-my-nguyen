"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Loader2,
  Search,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  Bell,
  Navigation,
} from "lucide-react";

import { Event } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

const EMPTY_FORM = {
  title: "",
  description: "",
  event_date: new Date().toISOString().split("T")[0],
  location: "",
  type: "le_gio",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { isAdmin } = useAuth();
  const sb = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await sb
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    setEvents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!form.title || !form.event_date) {
      toast.error("Vui lòng nhập tên và ngày diễn ra");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await sb.from("events").update(form).eq("id", editId);
        toast.success("Cập nhật sự kiện thành công");
      } else {
        await sb.from("events").insert(form);
        toast.success("Đã thêm sự kiện mới");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sự kiện này?")) return;
    try {
      await sb.from("events").delete().eq("id", id);
      toast.success("Đã xóa");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.location?.toLowerCase().includes(query.toLowerCase()),
  );

  const typeLabel = (t: string) =>
    ({
      le_gio: "Lễ Giỗ",
      hoi_hop: "Hội HọP",
      mung_tho: "Mừng Thọ",
      khac: "Khác",
    })[t] ?? t;

  const isPast = (date: string) => new Date(date) < new Date();

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-heritage-gold/10 glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center shadow-xl">
              <CalendarDays className="w-5 h-5 text-heritage-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold royal-text-gradient leading-none">Sự Kiện Dòng Họ</h1>
              <p className="text-xs text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
                Theo dõi các ngày lễ chạp, đại hội và sự kiện quan trọng
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="gold-gradient border-0 text-amber-950 font-bold hover:opacity-90 gap-1.5 shadow-lg"
              onClick={() => {
                setEditId(null);
                setForm(EMPTY_FORM);
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" /> Thêm sự kiện
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-gold/40" />
          <Input
            placeholder="Tìm kiếm sự kiện, địa điểm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-royal-card border-heritage-gold/20 focus:border-heritage-gold text-heritage-gold placeholder:text-heritage-gold/30 rounded-xl"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-heritage-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-heritage-gold/20 rounded-3xl bg-royal-card/50">
            <Bell className="w-12 h-12 text-heritage-gold/10 mx-auto mb-4" />
            <p className="text-heritage-gold-dim italic font-medium">Hiện tại chưa có sự kiện nào được ghi nhận</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filtered.map((e) => (
              <Card
                key={e.id}
                className={cn(
                  "group hover:royal-gold-glow border-heritage-gold/10 transition-all duration-500 overflow-visible",
                  isPast(e.event_date) && "opacity-70 grayscale-[0.5]",
                )}
              >
                {/* Status Badge Overlap */}
                <div className="absolute -top-3 right-4 z-20">
                  <Badge className={cn(
                    "font-bold border-0 shadow-lg px-4",
                    isPast(e.event_date) ? "bg-zinc-800 text-zinc-400" : "bg-red-600 text-white animate-pulse"
                  )}>
                    {isPast(e.event_date) ? "Đã diễn ra" : "Sắp tới"}
                  </Badge>
                </div>

                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 royal-halo bg-heritage-gold/5 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-heritage-gold/60" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg font-bold royal-text-gradient truncate">{e.title}</h3>
                      <Badge variant="outline" className="border-heritage-gold/30 text-heritage-gold/60 text-[9px] uppercase tracking-widest">{typeLabel(e.type ?? "")}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 bg-black/20 p-4 rounded-2xl border border-heritage-gold/5">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 text-heritage-gold/60" />
                      <span className="text-sm font-bold text-heritage-gold/90">
                        {new Date(e.event_date).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {e.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-heritage-gold/60 mt-0.5" />
                        <span className="text-xs text-heritage-gold/70 leading-relaxed italic">{e.location}</span>
                      </div>
                    )}
                  </div>

                  {e.description && (
                    <p className="text-xs text-heritage-gold-dim/80 leading-relaxed font-sans line-clamp-3">
                      {e.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-heritage-gold/5">
                    <Button variant="ghost" size="sm" className="gap-2 text-heritage-gold/60 hover:text-heritage-gold hover:bg-heritage-gold/10">
                      <Navigation className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold uppercase tracking-wider">Chỉ đường</span>
                    </Button>
                    {isAdmin && (
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-heritage-gold/10 text-heritage-gold/60 hover:text-heritage-gold"
                          onClick={() => {
                            setEditId(e.id);
                            setForm({
                              title: e.title,
                              description: e.description ?? "",
                              event_date: e.event_date,
                              location: e.location ?? "",
                              type: e.type ?? "le_gio",
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-red-500/10 text-red-500/60 hover:text-red-500"
                          onClick={() => handleDelete(e.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-royal-card border-heritage-gold/30">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl royal-text-gradient">
              {editId ? "Cập nhật sự kiện" : "Thêm sự kiện mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 custom-scrollbar max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Tên sự kiện *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Ngày diễn ra *</Label>
                <Input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Phân loại</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-heritage-gold/20 bg-black/20 text-heritage-gold text-sm outline-none"
                >
                  <option value="le_gio" className="bg-royal-maroon-dark">Lễ Giỗ</option>
                  <option value="hoi_hop" className="bg-royal-maroon-dark">Hội Họp</option>
                  <option value="mung_tho" className="bg-royal-maroon-dark">Mừng Thọ</option>
                  <option value="khac" className="bg-royal-maroon-dark">Khác</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Địa điểm tổ chức</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Mô tả sự kiện</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold min-h-[100px]"
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
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Lưu sự kiện
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
