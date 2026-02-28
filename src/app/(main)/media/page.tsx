"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ImageIcon, Plus, Loader2, Trash2, Search, X, Play, Clock } from "lucide-react";

import { Media } from "@/lib/types";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";
import { deleteMedia } from "@/lib/admin-actions";

const EMPTY_FORM = {
  title: "",
  description: "",
  url: "",
  type: "image",
  year: "",
};

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [filtered, setFiltered] = useState<Media[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);
  const sb = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await sb
      .from("media")
      .select("id, title, description, url, type, year, created_at, person_ids, uploaded_by")
      .order("created_at", { ascending: false });
    setMedia(data ?? []);
    setFiltered(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    sb.auth.getUser().then(({ data }: any) => {
      if (!data.user) return;
      sb.from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
        .then(({ data: p }: any) => setIsAdmin(p?.role === "admin"));
    });
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
          m.description?.toLowerCase().includes(q),
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
        });
      toast.success("Đã thêm vào thư viện");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (m: Media) => {
    if (!confirm(`Xoá "${m.title}"?`)) return;
    const res = await deleteMedia(m.id);
    if (res.error) {
      toast.error("Lỗi khi xoá: " + res.error);
    } else {
      toast.success("Đã xoá");
      await load();
    }
  };

  const images = filtered.filter((m) => m.type === "image");
  const videos = filtered.filter((m) => m.type === "video");

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 border-b border-border glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-amber-900" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">Thư Viện</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {media.length} ảnh & video dòng họ
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="gold-gradient border-0 text-amber-950 font-semibold hover:opacity-90 gap-1.5"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Thêm media
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <TabsList className="w-full sm:w-auto mb-4 bg-muted/50 p-1">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial gap-2">
              Tất cả <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px]">{media.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1 sm:flex-initial gap-2">
              Hình ảnh <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px]">{images.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 sm:flex-initial gap-2">
              Video <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px]">{videos.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : media.length === 0 ? (
              <EmptyState isAdmin={isAdmin} />
            ) : (
              <MediaGrid items={filtered} isAdmin={isAdmin} handleDelete={handleDelete} setSelected={setSelected} />
            )}
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            {images.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Chưa có hình ảnh nào</p>
              </div>
            ) : (
              <MediaGrid items={images} isAdmin={isAdmin} handleDelete={handleDelete} setSelected={setSelected} />
            )}
          </TabsContent>

          <TabsContent value="video" className="mt-0">
            {videos.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Chưa có video nào</p>
              </div>
            ) : (
              <MediaGrid items={videos} isAdmin={isAdmin} handleDelete={handleDelete} setSelected={setSelected} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Image lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setSelected(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[60vh] sm:h-[80vh] flex items-center justify-center">
              {selected.type === "video" ? (
                <video
                  src={selected.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-xl shadow-2xl"
                />
              ) : (
                <Image
                  src={selected.url}
                  alt={selected.title}
                  fill
                  className="object-contain rounded-xl"
                  sizes="100vw"
                />
              )}
            </div>
            <div className="text-center mt-4">
              <p className="text-white font-semibold">{selected.title}</p>
              {selected.year && (
                <p className="text-white/70 text-sm">{selected.year}</p>
              )}
              {selected.description && (
                <p className="text-white/60 text-sm italic mt-1">
                  {selected.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm ảnh / video</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Tiêu đề *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Họp mặt Tết 2025..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Loại</Label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as any }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="image">🖼️ Hình ảnh</option>
                  <option value="video">🎬 Video</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Năm</Label>
                <Input
                  type="number"
                  placeholder="2025"
                  value={form.year}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, year: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Tải ảnh / video trực tiếp *</Label>
              <ImageUpload
                bucket="media"
                value={form.url}
                onChange={(url, mType) =>
                  setForm((f) => ({ ...f, url, type: mType }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Mô tả</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Mô tả thêm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="gold-gradient border-0 text-amber-950"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">Chưa có nội dung</h3>
      <p className="text-sm text-muted-foreground text-center max-w-[250px]">
        Thư viện hiện đang trống. Hãy bắt đầu chia sẻ những khoảnh khắc của gia đình.
      </p>
      {isAdmin && (
        <Button variant="outline" className="mt-6 border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
          <Plus className="w-4 h-4 mr-2" /> Thêm ngay
        </Button>
      )}
    </div>
  );
}

function MediaGrid({
  items,
  isAdmin,
  handleDelete,
  setSelected,
}: {
  items: Media[];
  isAdmin: boolean;
  handleDelete: (m: Media) => void;
  setSelected: (m: Media) => void;
}) {
  const images = items.filter((m) => m.type === "image");
  const videos = items.filter((m) => m.type === "video");

  return (
    <div className="space-y-10 pb-10">
      {images.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-6 w-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <h2 className="text-base font-bold text-foreground/90 flex items-center gap-2">
              Hình ảnh
              <Badge variant="secondary" className="font-medium bg-muted text-[10px] px-2">{images.length}</Badge>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {images.map((m, idx) => (
              <div
                key={m.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="relative group aspect-square rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-muted/20 animate-in fade-in slide-in-from-bottom-2"
                onClick={() => setSelected(m)}
              >
                <Image
                  src={m.url}
                  alt={m.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-[11px] font-bold truncate">
                    {m.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-white/80 mt-1">
                    <Clock className="w-2.5 h-2.5" />
                    {m.created_at
                      ? new Date(m.created_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-600 z-10 shadow-lg scale-90 group-hover:scale-100"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDelete(m);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 delay-150 duration-500">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-6 w-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <h2 className="text-base font-bold text-foreground/90 flex items-center gap-2">
              Video bài giảng & lưu niệm
              <Badge variant="secondary" className="font-medium bg-muted text-[10px] px-2">{videos.length}</Badge>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((m, idx) => (
              <div
                key={m.id}
                style={{ animationDelay: `${200 + idx * 100}ms` }}
                className="relative group aspect-video rounded-3xl overflow-hidden border border-border/40 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-black/5 animate-in fade-in slide-in-from-bottom-2"
                onClick={() => setSelected(m)}
              >
                <video
                  src={m.url}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  preload="metadata"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center text-amber-950 shadow-2xl scale-90 group-hover:scale-110 transition-transform ring-4 ring-white/10">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <p className="text-white text-sm font-bold truncate">
                    {m.title}
                  </p>
                  <div className="flex items-center gap-2.5 text-[11px] text-white/90 mt-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md">
                      <Clock className="w-3.5 h-3.5" />
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                        : "N/A"}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-600 z-10 shadow-lg scale-90 group-hover:scale-100"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDelete(m);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
