"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ImageIcon, Plus, Loader2, Search, X, ScrollText, Clock } from "lucide-react";

import { Media } from "@/lib/types";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";
import { deleteMedia } from "@/lib/admin-actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { MEDIA_TYPES } from "@/lib/constants";
import { HeritageGallery } from "@/components/media/heritage-gallery";

const EMPTY_FORM: {
  title: string;
  description: string;
  url: string;
  type: typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES];
  year: string;
  category: string;
  transcription: string;
} = {
  title: "",
  description: "",
  url: "",
  type: MEDIA_TYPES.IMAGE,
  year: "",
  category: "general",
  transcription: "",
};

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [filtered, setFiltered] = useState<Media[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);

  const { isAdmin } = useAuth();
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb
      .from("media")
      .select("id, title, description, url, type, year, category, transcription, created_at, person_ids, uploaded_by")
      .order("created_at", { ascending: false });
    setMedia(data ?? []);
    setFiltered(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(media);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      media.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.transcription?.toLowerCase().includes(q)
      ),
    );
  }, [query, media]);

  const handleSave = async () => {
    if (!form.title || !form.url) {
      toast.error("Vui lòng nhập tên và URL");
      return;
    }
    setSaving(true);
    try {
      await sb
        .from("media")
        .insert({
          ...form,
          year: form.year ? parseInt(form.year) : null,
          description: form.description || null,
          transcription: form.transcription || null,
        });
      toast.success("Đã thêm vào thư viện di sản");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const {
    open: deleteConfirmOpen,
    setOpen: setDeleteConfirmOpen,
    data: mediaToDelete,
    loading: deleting,
    showConfirm: handleDelete,
    handleConfirm: confirmDelete,
  } = useConfirmModal<Media>({
    onConfirm: async (m) => {
      setMedia((prev) => prev.filter((item) => item.id !== m.id));
      return deleteMedia(m.id);
    },
    onSuccess: () => load(),
    successMessage: "Đã xoá thành công",
  });

  const images = filtered.filter((m) => m.type === MEDIA_TYPES.IMAGE && m.category !== "sac_phong");
  const archives = filtered.filter((m) => m.category === "sac_phong");
  const videos = filtered.filter((m) => m.type === MEDIA_TYPES.VIDEO);

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 border-b border-border glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-amber-900" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">Di Sản Dòng Họ</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {media.length} tư liệu & hình ảnh quý giá
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="gold-gradient border-0 text-amber-950 font-semibold hover:opacity-90 gap-1.5"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Thêm tư liệu
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tiêu đề, mô tả hoặc nội dung sắc phong..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <TabsList className="w-full sm:w-auto mb-6 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial gap-2 rounded-lg">
              Tất cả <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px]">{media.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1 sm:flex-initial gap-2 rounded-lg">
              Hình ảnh <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px]">{images.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex-1 sm:flex-initial gap-2 rounded-lg">
              Sắc phong <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px]">{archives.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 sm:flex-initial gap-2 rounded-lg">
              Video <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px]">{videos.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 outline-none">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : media.length === 0 ? (
              <EmptyState isAdmin={isAdmin} />
            ) : (
              <HeritageGallery items={filtered} isAdmin={isAdmin} onDelete={handleDelete} onSelect={setSelected} />
            )}
          </TabsContent>

          <TabsContent value="image" className="mt-0 outline-none">
            <HeritageGallery items={images} isAdmin={isAdmin} onDelete={handleDelete} onSelect={setSelected} />
          </TabsContent>

          <TabsContent value="archive" className="mt-0 outline-none">
            <HeritageGallery items={archives} isAdmin={isAdmin} onDelete={handleDelete} onSelect={setSelected} />
          </TabsContent>

          <TabsContent value="video" className="mt-0 outline-none">
            <HeritageGallery items={videos} isAdmin={isAdmin} onDelete={handleDelete} onSelect={setSelected} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Heritage Viewer / Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
            onClick={() => setSelected(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="max-w-6xl w-full h-full flex flex-col lg:flex-row gap-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visual Content */}
            <div className="flex-1 relative flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden border border-white/5">
              {selected.type === "video" ? (
                <video
                  src={selected.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={selected.url}
                    alt={selected.title}
                    fill
                    className="object-contain"
                    sizes="80vw"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Document Details / Transcription */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-y-auto max-h-[40vh] lg:max-h-full">
              <div>
                {selected.category === "sac_phong" && (
                  <Badge className="bg-amber-500 text-amber-950 font-bold mb-3 uppercase tracking-tighter">Sắc phong di sản</Badge>
                )}
                <h2 className="text-2xl font-serif font-bold text-white leading-tight">{selected.title}</h2>
                <div className="flex items-center gap-2 text-white/50 text-sm mt-3">
                  <Clock className="w-4 h-4" />
                  {selected.year ? `Năm ${selected.year}` : "Tư liệu cổ"}
                </div>
              </div>

              {selected.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Mô tả</h4>
                  <p className="text-white/80 text-sm leading-relaxed italic">{selected.description}</p>
                </div>
              )}

              {selected.transcription && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-amber-500">
                    <ScrollText className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Nội dung / Bản dịch</h4>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-amber-100/90 text-sm leading-loose whitespace-pre-wrap font-serif">
                      {selected.transcription}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6 opacity-30">
                <p className="text-[10px] text-white italic text-center">Gia Phả Họ Trần - Bảo tồn di sản ngàn đời</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl overflow-hidden border-amber-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Thêm Di Sản / Tư Liệu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase opacity-70">Tiêu đề *</Label>
                <Input
                  className="bg-muted/30 border-muted-foreground/20 rounded-xl"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Tiêu đề tư liệu..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase opacity-70">Năm</Label>
                <Input
                  className="bg-muted/30 border-muted-foreground/20 rounded-xl"
                  type="number"
                  placeholder="2025"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase opacity-70">Phân loại</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-muted-foreground/20 bg-muted/30 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="general">Ảnh gia đình</option>
                  <option value="sac_phong">Sắc phong / Tư liệu cổ</option>
                  <option value="event">Sự kiện / Lễ hội</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase opacity-70">Loại Media</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                  className="w-full h-10 px-3 rounded-xl border border-muted-foreground/20 bg-muted/30 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="image">🖼️ Hình ảnh</option>
                  <option value="video">🎬 Video</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Tải tệp lên *</Label>
              <ImageUpload
                bucket="media"
                value={form.url}
                onChange={(url, mType) => setForm((f) => ({ ...f, url, type: mType }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Mô tả ngắn</Label>
              <Input
                className="bg-muted/30 border-muted-foreground/20 rounded-xl"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Vài dòng giới thiệu về tư liệu này..."
              />
            </div>

            {form.category === "sac_phong" && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label className="text-xs font-bold uppercase text-amber-600">Nội dung / Bản dịch Hán Nôm</Label>
                <Textarea
                  className="bg-amber-50/50 border-amber-200 rounded-xl min-h-[120px] font-serif text-amber-950 placeholder:text-amber-900/40"
                  value={form.transcription}
                  onChange={(e) => setForm((f) => ({ ...f, transcription: e.target.value }))}
                  placeholder="Nhập nội dung chữ Hán hoặc bản dịch nghĩa..."
                />
              </div>
            )}
          </div>
          <DialogFooter className="bg-muted/20 p-4 border-t border-border">
            <Button variant="ghost" className="rounded-xl" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="gold-gradient border-0 text-amber-950 font-bold px-8 rounded-xl shadow-lg shadow-amber-500/20"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Lưu tư liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xóa tư liệu di sản"
        description={`Hành động này sẽ xóa vĩnh viễn "${mediaToDelete?.title}". Bạn có chắc chắn?`}
        variant="destructive"
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <ImageIcon className="w-10 h-10 text-amber-600" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">Kho lưu trữ trống</h3>
      <p className="text-sm text-muted-foreground text-center max-w-[250px]">
        Gia tộc chưa có tư liệu được tải lên. Hãy là người đầu tiên đóng góp!
      </p>
      {isAdmin && (
        <Button variant="outline" className="mt-6 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Thêm ngay
        </Button>
      )}
    </div>
  );
}
