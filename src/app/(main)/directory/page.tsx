"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  BookUser,
  ExternalLink,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

import { Contact, Member } from "@/lib/types";

type ContactWithMember = Contact & {
  members: { full_name: string } | null;
};

const EMPTY_FORM: any = {
  member_id: "",
  phone: "",
  email: "",
  address: "",
  facebook: "",
  zalo: "",
};

export default function DirectoryPage() {
  const [contacts, setContacts] = useState<ContactWithMember[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
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
    const [{ data: cData }, { data: mData }] = await Promise.all([
      sb.from("contacts").select("*, members(full_name)").order("created_at", { ascending: false }),
      sb.from("members").select("id, full_name").order("full_name", { ascending: true })
    ]);
    setContacts((cData as any) ?? []);
    setMembers((mData as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!form.member_id) {
      toast.error("Vui lòng chọn thành viên");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await sb.from("contacts").update(form).eq("id", editId);
        toast.success("Đã cập nhật liên hệ");
      } else {
        await sb.from("contacts").insert(form);
        toast.success("Đã thêm liên hệ mới");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa liên hệ này?")) return;
    try {
      await sb.from("contacts").delete().eq("id", id);
      toast.success("Đã xóa");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = contacts.filter(
    (c) =>
      c.members?.full_name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone?.includes(query) ||
      c.address?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-heritage-gold/10 glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center shadow-xl">
              <BookUser className="w-5 h-5 text-heritage-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold royal-text-gradient leading-none">Danh Bạ Liên Lạc</h1>
              <p className="text-xs text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
                Tìm kiếm thông tin liên hệ của bà con trong dòng họ
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
              <Plus className="w-4 h-4" /> Thêm mới
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-gold/40" />
          <Input
            placeholder="Tìm theo tên, số điện thoại hoặc địa chỉ..."
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
            <p className="text-heritage-gold-dim italic font-medium">Không tìm thấy thông tin liên hệ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filtered.map((c) => (
              <Card key={c.id} className="group hover:royal-gold-glow border-heritage-gold/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 royal-halo bg-heritage-maroon/20 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-500">
                      <span className="text-xl font-serif font-bold royal-text-gradient">
                        {c.members?.full_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg font-bold royal-text-gradient truncate">{c.members?.full_name || "N/A"}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-heritage-gold-dim/60 font-medium">Bà con nội tộc</p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {c.phone && (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-heritage-gold/5 border border-transparent hover:border-heritage-gold/20 transition-all group/item">
                        <Phone className="w-3.5 h-3.5 text-heritage-gold/60 group-hover/item:text-heritage-gold transition-colors" />
                        <span className="text-sm font-mono text-heritage-gold/80">{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-heritage-gold/5 border border-transparent hover:border-heritage-gold/20 transition-all group/item">
                        <Mail className="w-3.5 h-3.5 text-heritage-gold/60 group-hover/item:text-heritage-gold transition-colors" />
                        <span className="text-sm text-heritage-gold/80 truncate">{c.email}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-heritage-gold/5 border border-transparent hover:border-heritage-gold/20 transition-all group/item">
                        <MapPin className="w-3.5 h-3.5 text-heritage-gold/60 mt-0.5 group-hover/item:text-heritage-gold transition-colors" />
                        <span className="text-xs text-heritage-gold/70 leading-relaxed line-clamp-2">{c.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-heritage-gold/5">
                    <div className="flex gap-2">
                      {c.zalo && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/10">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {c.facebook && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/10">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-heritage-gold/10 text-heritage-gold/60 hover:text-heritage-gold"
                          onClick={() => {
                            setEditId(c.id);
                            setForm({
                              member_id: c.member_id ?? "",
                              phone: c.phone ?? "",
                              email: c.email ?? "",
                              address: c.address ?? "",
                              facebook: c.facebook ?? "",
                              zalo: c.zalo ?? "",
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
                          onClick={() => handleDelete(c.id)}
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
              {editId ? "Cập nhật liên hệ" : "Thêm liên hệ mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 custom-scrollbar max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Thành viên *</Label>
              <select
                value={form.member_id}
                onChange={(e) => setForm((f: any) => ({ ...f, member_id: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border border-heritage-gold/20 bg-black/20 text-heritage-gold text-sm outline-none focus:border-heritage-gold/50"
              >
                <option value="" className="bg-royal-maroon-dark">— Chọn thành viên —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-royal-maroon-dark">
                    {m.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Số điện thoại</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))}
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm((f: any) => ({ ...f, email: e.target.value }))}
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Địa chỉ thường trú</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f: any) => ({ ...f, address: e.target.value }))}
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Link Facebook</Label>
                <Input
                  value={form.facebook}
                  onChange={(e) => setForm((f: any) => ({ ...f, facebook: e.target.value }))}
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Link Zalo</Label>
                <Input
                  value={form.zalo}
                  onChange={(e) => setForm((f: any) => ({ ...f, zalo: e.target.value }))}
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
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
              Lưu thông tin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
