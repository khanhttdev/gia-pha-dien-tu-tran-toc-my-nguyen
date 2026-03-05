"use client";

import { Media } from "@/lib/types";
import Image from "next/image";
import { Clock, Play, Trash2, ZoomIn, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface HeritageGalleryProps {
    items: Media[];
    isAdmin: boolean;
    onDelete: (m: Media) => void;
    onSelect: (m: Media) => void;
}

export function HeritageGallery({
    items,
    isAdmin,
    onDelete,
    onSelect,
}: HeritageGalleryProps) {
    const images = items.filter((m) => m.type === "image");
    const videos = items.filter((m) => m.type === "video");

    return (
        <div className="space-y-16 pb-10">
            {images.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex items-center gap-4 mb-10 px-2">
                        <div className="h-10 w-1.5 bg-heritage-gold rounded-full shadow-[0_0_20px_rgba(252,211,77,0.5)]" />
                        <div>
                            <h2 className="text-3xl font-serif font-bold royal-text-gradient uppercase tracking-widest">
                                Kho Lưu Trữ Hình Ảnh
                            </h2>
                            <p className="text-sm text-heritage-gold-dim italic font-medium opacity-70">
                                Ghi lại những khoảnh khắc trường tồn của tộc ta
                            </p>
                        </div>
                    </div>

                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                        {images.map((m) => (
                            <Card
                                key={m.id}
                                className={cn(
                                    "break-inside-avoid relative group overflow-hidden cursor-pointer transition-all duration-700 hover:royal-gold-glow",
                                    m.category === "sac_phong"
                                        ? "border-heritage-gold/40 shadow-2xl bg-amber-950/20"
                                        : "border-heritage-gold/10 hover:border-heritage-gold/30",
                                )}
                                onClick={() => onSelect(m)}
                            >
                                {/* Image Container */}
                                <div className="relative w-full overflow-hidden rounded-xl">
                                    <Image
                                        src={m.url}
                                        alt={m.title}
                                        width={400}
                                        height={600}
                                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                                        loading="lazy"
                                    />

                                    {/* Category Badge */}
                                    {m.category === "sac_phong" && (
                                        <Badge className="absolute top-4 left-4 bg-heritage-gold text-amber-950 border-0 shadow-2xl backdrop-blur-md flex gap-1.5 items-center px-4 py-1.5 font-bold uppercase tracking-tighter scale-105 z-20">
                                            <FileText className="w-4 h-4" /> Sắc phong
                                        </Badge>
                                    )}

                                    {/* Transcription Preview for Sac Phong */}
                                    {m.category === "sac_phong" && m.transcription && (
                                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-8 z-10 backdrop-blur-sm">
                                            <div className="text-center space-y-4">
                                                <p className="text-heritage-gold/90 text-sm font-serif leading-relaxed line-clamp-6 italic">
                                                    &quot;{m.transcription}&quot;
                                                </p>
                                                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-heritage-gold/50 to-transparent mx-auto" />
                                                <span className="text-[10px] text-heritage-gold-dim font-bold uppercase tracking-[0.2em] block">
                                                    Bản dịch thư tịch
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hover Overlay for normal images */}
                                    {m.category !== "sac_phong" && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                            <ZoomIn className="w-8 h-8 text-heritage-gold/60 mx-auto" />
                                        </div>
                                    )}
                                </div>

                                {/* Info Area */}
                                <div className="pt-4 space-y-2 relative z-10">
                                    <h3 className="text-base font-serif font-bold royal-text-gradient truncate group-hover:tracking-wide transition-all duration-300">
                                        {m.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-heritage-gold-dim uppercase tracking-widest opacity-60">
                                            <Clock className="w-3.5 h-3.5" />
                                            {m.year
                                                ? `Năm ${m.year}`
                                                : m.created_at
                                                    ? new Date(m.created_at).getFullYear()
                                                    : "Cổ xưa"}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                {isAdmin && (
                                    <button
                                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-red-500 z-30 shadow-2xl scale-90 group-hover:scale-100"
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            onDelete(m);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {videos.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 delay-300 duration-1000">
                    <div className="flex items-center gap-4 mb-10 px-2">
                        <div className="h-10 w-1.5 bg-heritage-gold rounded-full shadow-[0_0_20px_rgba(252,211,77,0.5)]" />
                        <div>
                            <h2 className="text-3xl font-serif font-bold royal-text-gradient uppercase tracking-widest">
                                Video Tư Liệu
                            </h2>
                            <p className="text-sm text-heritage-gold-dim italic font-medium opacity-70">
                                Những thước phim sống động về cội nguồn
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {videos.map((m) => (
                            <Card
                                key={m.id}
                                className="relative group aspect-video overflow-hidden cursor-pointer hover:royal-gold-glow border-heritage-gold/10"
                                onClick={() => onSelect(m)}
                            >
                                <video
                                    src={m.url}
                                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700"
                                    preload="metadata"
                                    muted
                                />

                                {/* Play Button Halo */}
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="w-20 h-20 royal-halo bg-heritage-gold/5 backdrop-blur-sm group-hover:scale-110 transition-transform duration-700">
                                        <Play className="w-10 h-10 fill-heritage-gold text-heritage-gold ml-2 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
                                    </div>
                                </div>

                                {/* Video Info Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 transition-all duration-500 group-hover:pt-20">
                                    <h3 className="text-xl font-serif font-bold royal-text-gradient mb-3">
                                        {m.title}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <Badge
                                            variant="outline"
                                            className="text-heritage-gold border-heritage-gold/30 bg-heritage-gold/5 px-3 py-1 font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            {m.year ? `Năm ${m.year}` : "Tư liệu phim"}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
