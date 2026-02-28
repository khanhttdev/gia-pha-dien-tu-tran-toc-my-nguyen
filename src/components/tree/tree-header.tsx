"use client";
import { Dispatch, SetStateAction } from "react";
import { ListIcon, NetworkIcon } from "lucide-react";

export type ViewMode = "tree" | "list";

export function TreeHeader({
    viewMode,
    setViewMode,
    isMobile
}: {
    viewMode: ViewMode;
    setViewMode: Dispatch<SetStateAction<ViewMode>>;
    isMobile: boolean;
}) {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[95%] md:w-auto">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 px-4 md:px-10 py-3 md:py-4 rounded-xl bg-gradient-to-b from-[#1a0505]/95 to-[#2a0a0f]/95 border border-[var(--color-heritage-gold-dim)]/40 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(230,200,117,0.2)] backdrop-blur-md">

                <div className="flex items-center gap-4 md:gap-8 w-full justify-between md:justify-center">

                    {/* Logo Tree */}
                    <div className="relative flex items-center justify-center shrink-0 hidden md:flex">
                        <div className="absolute inset-0 bg-[var(--color-heritage-gold)]/20 blur-xl rounded-full"></div>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-[var(--color-heritage-gold)] relative z-10 drop-shadow-[0_0_12px_rgba(230,200,117,0.8)]">
                            {/* SVG path that resembles a classic heritage family tree */}
                            <path fillRule="evenodd" d="M12 22a1 1 0 01-1-1v-5.2c-2.3-.6-4.2-2.1-5.4-4.2a1 1 0 111.7-1 5.9 5.9 0 004.7 3.3V10.2a6 6 0 01-3.6-2.5 1 1 0 111.6-1.2c.8 1 2 1.6 3 1.6V4a1 1 0 112 0v4c1.1 0 2.3-.6 3-1.6a1 1 0 111.6 1.2 6 6 0 01-3.6 2.5v3.7a5.9 5.9 0 004.7-3.3 1 1 0 111.7 1c-1.2 2-3.1 3.6-5.4 4.2V21a1 1 0 01-1 1z" clipRule="evenodd" />
                            <circle cx="12" cy="4" r="1.5" />
                            <circle cx="7" cy="8" r="1.2" />
                            <circle cx="17" cy="8" r="1.2" />
                            <circle cx="5" cy="13" r="1" />
                            <circle cx="19" cy="13" r="1" />
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="15" cy="12" r="1" />
                        </svg>
                    </div>

                    {/* Typography Column */}
                    <div className="flex flex-col items-center justify-center min-w-[200px] md:min-w-[340px]">
                        <span className="font-serif text-[9px] md:text-[11px] tracking-[0.2em] text-[var(--color-heritage-gold-dim)] uppercase font-semibold">
                            Ghi Chép Dòng Họ
                        </span>

                        <h1 className="font-serif text-xl md:text-3xl tracking-widest text-[var(--color-heritage-gold)] uppercase font-bold mt-1 mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center text-shadow-glow">
                            Trần Tộc Mỹ Nguyên
                        </h1>

                        <div className="flex items-center gap-3 w-full justify-center">
                            <div className="h-[2px] w-8 md:w-16 bg-gradient-to-r from-transparent to-[var(--color-heritage-gold-dim)]/70 rounded-full"></div>
                            <span className="font-serif text-[8px] md:text-[10px] tracking-[0.2em] text-[var(--color-heritage-gold-dim)] uppercase whitespace-nowrap">
                                Di Sản & Dòng Dõi
                            </span>
                            <div className="h-[2px] w-8 md:w-16 bg-gradient-to-l from-transparent to-[var(--color-heritage-gold-dim)]/70 rounded-full"></div>
                        </div>
                    </div>

                    {/* Left/Right Actions / View Controls inside Header */}
                    <div className="flex items-center gap-1 md:gap-3 md:pl-8 md:border-l border-[var(--color-heritage-gold-dim)]/30">
                        <button
                            onClick={() => setViewMode("tree")}
                            className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-lg transition-all duration-300 ${viewMode === "tree"
                                ? "bg-[var(--color-heritage-gold)] text-black shadow-[0_0_15px_rgba(230,200,117,0.4)]"
                                : "text-[var(--color-heritage-gold)] bg-black/40 hover:bg-white/10"
                                }`}
                            title="Xem Sơ Đồ Cây"
                        >
                            <NetworkIcon className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-lg transition-all duration-300 ${viewMode === "list"
                                ? "bg-[var(--color-heritage-gold)] text-black shadow-[0_0_15px_rgba(230,200,117,0.4)]"
                                : "text-[var(--color-heritage-gold)] bg-black/40 hover:bg-white/10"
                                }`}
                            title="Xem Danh Sách"
                        >
                            <ListIcon className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
