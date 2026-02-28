"use client";

import { useEffect, useState } from "react";
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
import { ImageIcon, Plus, Loader2, Trash2, Search, X } from "lucide-react";

import { Media } from "@/lib/types";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";

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
      .select("*")
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
        .select("*")
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
    await sb.from("media").delete().eq("id", m.id);
    toast.success("Đã xoá");
    await load();
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
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-sm">Chưa có ảnh hoặc video nào</p>
            {isAdmin && (
              <p className="text-xs mt-2">
                Nhấn <span className="text-amber-500">+ Thêm media</span> để bắt
                đầu
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {images.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Hình ảnh ({images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((m) => (
                    <div
                      key={m.id}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-border/60 cursor-pointer"
                      onClick={() => setSelected(m)}
                    >
                      <Image
                        src={m.url}
                        alt={m.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-white text-xs font-medium truncate">
                            {m.title}
                          </p>
                          {m.year && (
                            <p className="text-white/70 text-[10px]">
                              {m.year}
                            </p>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          className="absolute top-2 right-2 w-6 h-6 rounded-md bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleDelete(m);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {videos.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Video ({videos.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {videos.map((m) => (
                    <div
                      key={m.id}
                      className="glass rounded-xl p-4 border border-border/60 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                          🎬
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {m.title}
                          </p>
                          {m.year && (
                            <p className="text-xs text-muted-foreground">
                              {m.year}
                            </p>
                          )}
                          {m.description && (
                            <p className="text-xs text-muted-foreground italic truncate">
                              {m.description}
                            </p>
                          )}
                        </div>
                        {isAdmin && (
                          <Button
                            aria-label="Action Button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-red-500"
                            onClick={() => handleDelete(m)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
            <div className="relative w-full h-[60vh] sm:h-[80vh]">
              <Image
                src={selected.url}
                alt={selected.title}
                fill
                className="object-contain rounded-xl"
                sizes="100vw"
              />
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
                onChange={(url) => setForm((f) => ({ ...f, url }))}
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
