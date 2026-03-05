"use client";

import { Maximize2, Settings, X } from "lucide-react";

export function TreeHeader() {
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            {/* Floating Glass Panel */}
            <div className="flex items-center gap-6 px-6 py-3 bg-[#130a08]/85 backdrop-blur-md border border-heritage-gold/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] pointer-events-auto">

                {/* Tree Logo */}
                <div className="relative w-14 h-14 shrink-0 drop-shadow-[0_0_8px_rgba(230,200,117,0.4)]">
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                        {/* Roots */}
                        <path d="M46 80 C40 85, 25 88, 15 90" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <path d="M54 80 C60 85, 75 88, 85 90" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <path d="M50 80 C50 85, 50 90, 50 95" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <path d="M43 82 C35 88, 25 90, 20 95" stroke="#fcd34d" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
                        <path d="M57 82 C65 88, 75 90, 80 95" stroke="#fcd34d" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />

                        {/* Trunk */}
                        <path d="M45 80 C45 65, 40 50, 25 35" stroke="#fcd34d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M55 80 C55 65, 60 50, 75 35" stroke="#fcd34d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M50 80 C50 60, 50 40, 50 20" stroke="#fcd34d" strokeWidth="3" fill="none" strokeLinecap="round" />

                        {/* Inner Branches */}
                        <path d="M45 60 C35 55, 30 45, 20 40" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <path d="M55 60 C65 55, 70 45, 80 40" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <path d="M48 40 C40 30, 35 25, 30 15" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <path d="M52 40 C60 30, 65 25, 70 15" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                        {/* Leaves / Canopy Dots */}
                        <circle cx="20" cy="35" r="2" fill="#fef3c7" className="animate-pulse" />
                        <circle cx="80" cy="35" r="2" fill="#fef3c7" className="animate-pulse" />
                        <circle cx="30" cy="15" r="2" fill="#fef3c7" />
                        <circle cx="70" cy="15" r="2" fill="#fef3c7" />
                        <circle cx="50" cy="10" r="2.5" fill="#fef3c7" className="animate-pulse" />
                        <circle cx="35" cy="45" r="1.5" fill="#fef3c7" />
                        <circle cx="65" cy="45" r="1.5" fill="#fef3c7" />
                        <circle cx="40" cy="25" r="1.5" fill="#fef3c7" />
                        <circle cx="60" cy="25" r="1.5" fill="#fef3c7" />
                    </svg>
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-center justify-center min-w-[280px]">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-heritage-gold-dim/80 font-bold mb-1">
                        GIA PHẢ ĐIỆN TỬ
                    </p>
                    <h1 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#fef3c7] via-[#fcd34d] to-[#d97706] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        TRẦN TỘC MỸ NGUYÊN
                    </h1>

                    {/* Ornamental underline */}
                    <div className="flex items-center gap-3 mt-1.5 w-full justify-center">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-heritage-gold/50" />
                        <p className="text-[10px] text-heritage-gold-dim/70 capitalize tracking-wide whitespace-nowrap">
                            Lưu Tích & Truyền Thừa
                        </p>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-heritage-gold/50" />
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <button className="flex items-center justify-center w-7 h-7 rounded-md bg-[#1d1110] border border-heritage-gold/10 hover:border-heritage-gold/40 hover:bg-[#2a1816] transition-colors group">
                        <Settings className="w-3.5 h-3.5 text-heritage-gold-dim/70 group-hover:text-heritage-gold" />
                    </button>
                    <button className="flex items-center justify-center w-7 h-7 rounded-md bg-[#1d1110] border border-heritage-gold/10 hover:border-heritage-gold/40 hover:bg-[#2a1816] transition-colors group">
                        <Maximize2 className="w-3.5 h-3.5 text-heritage-gold-dim/70 group-hover:text-heritage-gold" />
                    </button>
                    <button className="flex items-center justify-center w-7 h-7 rounded-md bg-[#1d1110] border border-heritage-gold/10 hover:border-red-500/40 hover:bg-red-950/30 transition-colors group">
                        <X className="w-4 h-4 text-heritage-gold-dim/70 group-hover:text-red-400" />
                    </button>
                </div>

            </div>
        </div>
    );
}
