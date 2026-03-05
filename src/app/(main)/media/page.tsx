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
import { ImageIcon, Plus, Loader2, Search, X, ScrollText, Clock, FileText, Video as VideoIcon } from "lucide-react";

import { Media } from "@/lib/types";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";
import { deleteMedia } from "@/lib/admin-actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { MEDIA_TYPES } from "@/lib/constants";
import { HeritageGallery } from "@/components/media/heritage-gallery";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-heritage-gold/10 glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center shadow-xl">
              <ImageIcon className="w-5 h-5 text-heritage-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold royal-text-gradient leading-none">Thư Viện Di Sản</h1>
              <p className="text-xs text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
                Lưu giữ những tài liệu, hình ảnh và video quý giá của dòng tộc
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="gold-gradient border-0 text-amber-950 font-bold hover:opacity-90 gap-1.5 shadow-lg"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4" /> Đóng góp tư liệu
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-gold/40" />
          <Input
            placeholder="Tìm kiếm tư liệu, sắc phong, hình ảnh..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-royal-card border-heritage-gold/20 focus:border-heritage-gold text-heritage-gold placeholder:text-heritage-gold/30 rounded-xl"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
        <Tabs defaultValue="all" className="w-full flex flex-col">
          <TabsList className="w-full sm:w-auto mb-8 bg-heritage-maroon/40 p-1 rounded-xl border border-heritage-gold/10 self-start">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial gap-2 rounded-lg data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-wider transition-all duration-300">
              Tất cả <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] bg-black/30 border-0">{media.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1 sm:flex-initial gap-2 rounded-lg data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-wider transition-all duration-300">
              <ImageIcon className="w-3.5 h-3.5" /> Ảnh <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] bg-black/30 border-0">{images.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex-1 sm:flex-initial gap-2 rounded-lg data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-wider transition-all duration-300">
              <FileText className="w-3.5 h-3.5" /> Sắc phong <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] bg-black/30 border-0">{archives.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 sm:flex-initial gap-2 rounded-lg data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-wider transition-all duration-300">
              <VideoIcon className="w-3.5 h-3.5" /> Video <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] bg-black/30 border-0">{videos.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 outline-none">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-heritage-gold" />
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
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-500 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-heritage-gold/10 text-heritage-gold/70 hover:text-heritage-gold hover:bg-heritage-gold/20 transition-all z-[110] border border-heritage-gold/20"
            onClick={() => setSelected(null)}
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-7xl w-full h-[90vh] flex flex-col lg:flex-row gap-8 overflow-hidden animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visual Content Container */}
            <div className="flex-[3] relative flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden border border-heritage-gold/10 royal-gold-glow">
              {selected.type === "video" ? (
                <video
                  src={selected.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-xl"
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={selected.url}
                    alt={selected.title}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Information Panel */}
            <div className="flex-1 flex flex-col gap-8 p-10 bg-royal-card border border-heritage-gold/20 rounded-3xl overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 royal-halo bg-heritage-gold/5 flex items-center justify-center">
                    {selected.type === "video" ? <VideoIcon className="w-5 h-5 text-heritage-gold" /> : <ImageIcon className="w-5 h-5 text-heritage-gold" />}
                  </div>
                  {selected.category === "sac_phong" && (
                    <Badge className="bg-heritage-gold text-amber-950 font-bold px-3 py-1 uppercase tracking-tighter">Bảo vật di sản</Badge>
                  )}
                </div>
                <h2 className="text-3xl font-serif font-bold royal-text-gradient leading-tight">{selected.title}</h2>
                <div className="flex items-center gap-3 text-heritage-gold/50 text-xs font-bold uppercase tracking-widest pt-2">
                  <Clock className="w-4 h-4 text-heritage-gold/30" />
                  {selected.year ? `Năm ${selected.year}` : "Tư liệu dòng tộc cổ"}
                </div>
              </div>

              {selected.description && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-heritage-gold uppercase tracking-[0.3em] opacity-40">Mô tả tư liệu</h4>
                  <p className="text-heritage-gold/80 text-sm leading-relaxed italic font-serif bg-heritage-gold/5 p-4 rounded-2xl border border-heritage-gold/10">
                    &quot;{selected.description}&quot;
                  </p>
                </div>
              )}

              {selected.transcription && (
                <div className="space-y-4 pt-6 border-t border-heritage-gold/10">
                  <div className="flex items-center gap-2 text-heritage-gold">
                    <ScrollText className="w-5 h-5" />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em]">Nội dung / Bản dịch</h4>
                  </div>
                  <div className="bg-black/40 p-6 rounded-2xl border border-heritage-gold/10 royal-gold-glow">
                    <p className="text-heritage-gold/90 text-sm leading-loose whitespace-pre-wrap font-serif italic">
                      {selected.transcription}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-10 text-center space-y-2 opacity-30">
                <div className="h-px w-12 bg-heritage-gold/50 mx-auto mb-4" />
                <p className="text-[9px] text-heritage-gold uppercase tracking-[0.4em] font-bold">Gia Phả Họ Trần</p>
                <p className="text-[8px] text-heritage-gold-dim italic font-medium">Bảo tồn di sản ngàn đời của Mỹ Nguyên tộc</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-royal-card border-heritage-gold/30 rounded-3xl overflow-hidden p-0">
          <DialogHeader className="p-6 border-b border-heritage-gold/10">
            <DialogTitle className="text-2xl font-serif font-bold royal-text-gradient">Đóng góp Di Sản / Tư Liệu</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-8 custom-scrollbar max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Tiêu đề tư liệu *</Label>
                <Input
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold rounded-xl h-11"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Tiêu đề..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Năm ghi nhận</Label>
                <Input
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold rounded-xl h-11"
                  type="number"
                  placeholder="VD: 1985"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Phân loại</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-heritage-gold/20 bg-black/20 text-heritage-gold text-sm outline-none focus:border-heritage-gold/50"
                >
                  <option value="general" className="bg-royal-maroon-dark">Ảnh gia đình</option>
                  <option value="sac_phong" className="bg-royal-maroon-dark">Sắc phong / Tư liệu cổ</option>
                  <option value="event" className="bg-royal-maroon-dark">Sự kiện / Lễ hội</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Loại phương tiện</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                  className="w-full h-11 px-4 rounded-xl border border-heritage-gold/20 bg-black/20 text-heritage-gold text-sm outline-none focus:border-heritage-gold/50"
                >
                  <option value="image" className="bg-royal-maroon-dark">🖼️ Hình ảnh</option>
                  <option value="video" className="bg-royal-maroon-dark">🎬 Video</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Tải lên tệp di sản *</Label>
              <ImageUpload
                bucket="media"
                value={form.url}
                onChange={(url, mType) => setForm((f) => ({ ...f, url, type: mType }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Mô tả sơ lược</Label>
              <Input
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold rounded-xl h-11"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Vài dòng giới thiệu..."
              />
            </div>

            {form.category === "sac_phong" && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                <Label className="text-heritage-gold text-xs font-bold uppercase tracking-widest">Nội dung Hán Nôm / Bản dịch</Label>
                <Textarea
                  className="bg-heritage-gold/5 border-heritage-gold/20 rounded-2xl min-h-[150px] font-serif text-heritage-gold placeholder:text-heritage-gold/20 p-4 leading-relaxed italic"
                  value={form.transcription}
                  onChange={(e) => setForm((f) => ({ ...f, transcription: e.target.value }))}
                  placeholder="Nhập nội dung chữ Hán hoặc bản dịch nghĩa..."
                />
              </div>
            )}
          </div>
          <DialogFooter className="bg-black/40 p-6 border-t border-heritage-gold/10">
            <Button variant="ghost" className="rounded-xl text-heritage-gold hover:bg-heritage-gold/10 font-bold" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="gold-gradient border-0 text-amber-950 font-bold px-10 rounded-xl shadow-2xl shadow-amber-500/20"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Lưu vào kho lưu trữ
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
    <div className="flex flex-col items-center justify-center py-32 bg-royal-card/30 rounded-[40px] border border-dashed border-heritage-gold/20 animate-in fade-in zoom-in-95 duration-1000">
      <div className="w-24 h-24 rounded-full royal-halo bg-heritage-gold/5 flex items-center justify-center mb-6 shadow-2xl">
        <ImageIcon className="w-12 h-12 text-heritage-gold/40" />
      </div>
      <h3 className="text-2xl font-serif font-bold royal-text-gradient mb-2">Kho di sản đang chờ...</h3>
      <p className="text-sm text-heritage-gold-dim italic text-center max-w-[300px] font-medium opacity-60 px-4">
        Gia tộc chưa có tư liệu được tải lên. Hãy là người đầu tiên ghi danh vào sử sách dòng họ!
      </p>
      {isAdmin && (
        <Button variant="outline" className="mt-10 border-heritage-gold/30 text-heritage-gold hover:bg-heritage-gold/10 rounded-xl px-8 h-12 font-bold uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> Đóng góp ngay
        </Button>
      )}
    </div>
  );
}
