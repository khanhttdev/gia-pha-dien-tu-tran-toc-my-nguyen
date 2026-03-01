"use client";

import { Media } from "@/lib/types";
import Image from "next/image";
import { Clock, Play, Trash2, ZoomIn, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeritageGalleryProps {
    items: Media[];
    isAdmin: boolean;
    onDelete: (m: Media) => void;
    onSelect: (m: Media) => void;
}

export function HeritageGallery({ items, isAdmin, onDelete, onSelect }: HeritageGalleryProps) {
    const images = items.filter((m) => m.type === "image");
    const videos = items.filter((m) => m.type === "video");

    return (
        <div className="space-y-12 pb-10">
            {images.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-1.5 bg-amber-600 rounded-full shadow-[0_0_15px_rgba(180,83,9,0.4)]" />
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-foreground/90 uppercase tracking-widest">Kho Lưu Trữ Hình Ảnh</h2>
                            <p className="text-sm text-muted-foreground italic">Ghi lại những khoảnh khắc trường tồn của tộc ta</p>
                        </div>
                    </div>

                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {images.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "break-inside-avoid relative group rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer bg-muted/20",
                                    m.category === "sac_phong"
                                        ? "border-amber-500/40 shadow-[0_0_20px_rgba(180,83,9,0.1)] bg-amber-50/5 dark:bg-amber-950/10"
                                        : "border-amber-900/10 shadow-sm hover:shadow-2xl hover:border-amber-500/30"
                                )}
                                onClick={() => onSelect(m)}
                            >
                                {/* Luxury Frame for Sac Phong */}
                                {m.category === "sac_phong" && (
                                    <div className="absolute inset-0 border-[6px] border-double border-amber-600/20 pointer-events-none z-10" />
                                )}

                                {/* Image Container */}
                                <div className="relative w-full overflow-hidden">
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
                                        <Badge className="absolute top-4 left-4 bg-amber-700 text-white border-0 shadow-lg backdrop-blur-md flex gap-1.5 items-center px-3 py-1 scale-110">
                                            <FileText className="w-3.5 h-3.5" /> Sắc phong
                                        </Badge>
                                    )}

                                    {/* Transcription Preview for Sac Phong */}
                                    {m.category === "sac_phong" && m.transcription && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 z-20">
                                            <div className="text-center">
                                                <p className="text-amber-100 text-xs font-serif leading-relaxed line-clamp-6">
                                                    "{m.transcription}"
                                                </p>
                                                <div className="mt-4 h-px w-12 bg-amber-500/50 mx-auto" />
                                                <span className="text-[10px] text-amber-400/80 mt-2 block uppercase tracking-tighter">Bản dịch thư tịch</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Overlay Info */}
                                <div className={cn(
                                    "p-4 transition-colors duration-500",
                                    m.category === "sac_phong"
                                        ? "bg-amber-900/90 text-amber-50"
                                        : "bg-gradient-to-b from-transparent to-black/80 text-white"
                                )}>
                                    <h3 className="text-sm font-bold truncate group-hover:text-amber-400 transition-colors uppercase tracking-wider font-serif">
                                        {m.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] opacity-70">
                                            <Clock className="w-3 h-3" />
                                            {m.year ? `Năm ${m.year}` : (m.created_at ? new Date(m.created_at).getFullYear() : "N/A")}
                                        </div>
                                        <ZoomIn className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-amber-400 transition-all" />
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                {isAdmin && (
                                    <button
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-600 z-10 shadow-lg"
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            onDelete(m);
                                        }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {videos.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-1.5 bg-amber-600 rounded-full shadow-[0_0_15px_rgba(180,83,9,0.4)]" />
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-foreground/90">Video Tư Liệu</h2>
                            <p className="text-sm text-muted-foreground italic">Những thước phim sống động về cội nguồn</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {videos.map((m) => (
                            <div
                                key={m.id}
                                className="relative group aspect-video rounded-3xl overflow-hidden border border-amber-900/10 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-black"
                                onClick={() => onSelect(m)}
                            >
                                <video
                                    src={m.url}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                    preload="metadata"
                                    muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-amber-500/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                        <Play className="w-8 h-8 fill-amber-500 text-amber-500 ml-1" />
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                                    <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                                            {m.year ? `Năm ${m.year}` : "Tư liệu"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
