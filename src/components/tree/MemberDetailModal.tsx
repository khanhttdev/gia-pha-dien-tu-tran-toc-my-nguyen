"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { TreeMember, getMeta, getInitials } from "@/lib/tree-utils";
import { MemberMetadata, Spouse } from "@/lib/types";

type MemberDetailModalProps = {
    member: TreeMember | null;
    spouseData?: Spouse | null;
    onClose: () => void;
};

export function MemberDetailModal({ member, spouseData, onClose }: MemberDetailModalProps) {
    // Close on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    if (!member) return null;

    const meta = getMeta(member);
    const isDeceased = meta.is_alive === false;
    const isMale = member.gender === "male";
    const initials = getInitials(member.full_name);
    const spouses = member.spouses || [];
    const spouseNames = spouses.map((s) => s.full_name).join(", ");

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={`Chi tiết ${member.full_name}`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal Card */}
            <div
                className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden border-[1.5px] border-heritage-gold/30 bg-royal-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 group"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gloss Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-20" />

                {/* Ornamental SVG Corners */}
                <svg className="absolute top-2 left-2 w-8 h-8 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
                    <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
                </svg>
                <svg className="absolute top-2 right-2 w-8 h-8 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-500 pointer-events-none rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
                    <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
                </svg>
                <svg className="absolute bottom-2 left-2 w-8 h-8 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-500 pointer-events-none -rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
                    <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
                </svg>
                <svg className="absolute bottom-2 right-2 w-8 h-8 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-500 pointer-events-none rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
                    <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
                </svg>

                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col items-center">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-background/30 hover:bg-background/50 text-heritage-gold/80 hover:text-heritage-gold transition-colors"
                        aria-label="Đóng"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    {/* Header badge */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-heritage-gold/15 flex items-center justify-center mb-1">
                            <span className="text-heritage-gold font-serif text-[10px] font-bold">GP</span>
                        </div>
                        <h2 className="text-xs uppercase tracking-[0.2em] text-heritage-gold-dim/70 font-semibold">
                            Family Member Profile
                        </h2>
                    </div>

                    {/* Ornament line */}
                    <div className="flex items-center gap-2 mb-4 w-full justify-center">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-heritage-gold-dim/40" />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-heritage-gold/50">
                            <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" fill="currentColor" />
                        </svg>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-heritage-gold-dim/40" />
                    </div>

                    {/* Avatar */}
                    <div
                        className={`
                            w-24 h-24 ${isMale ? "royal-halo" : "royal-halo-pink"}
                        `}
                    >
                        {meta.avatar_url ? (
                            <div className="w-full h-full p-1">
                                <img
                                    src={meta.avatar_url}
                                    alt={member.full_name}
                                    width={96}
                                    height={96}
                                    loading="lazy"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        ) : (
                            <span className="drop-shadow-md">{initials}</span>
                        )}
                    </div>

                    {/* Name */}
                    <h3 className="mt-4 text-2xl font-serif font-bold royal-text-gradient tracking-wide text-center">
                        {member.full_name}
                    </h3>
                    <p className="text-xs text-heritage-gold-dim/50 mt-0.5">
                        Đời {member.generation_level}
                    </p>

                    {/* Info grid: Birth / Death / Spouse */}
                    <div className="mt-5 grid grid-cols-3 gap-3 w-full max-w-xs">
                        {/* Birth */}
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-1 mb-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-heritage-gold/70">
                                    <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" fill="currentColor" />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-heritage-gold/80 tracking-wider">Sinh</span>
                            </div>
                            <p className="text-[11px] text-foreground/80 leading-tight">
                                {meta.birth_year || "Không rõ"}
                            </p>
                        </div>

                        {/* Death */}
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-1 mb-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-heritage-gold/70">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-heritage-gold/80 tracking-wider">Mất</span>
                            </div>
                            <p className="text-[11px] text-foreground/80 leading-tight">
                                {isDeceased ? (meta.death_year || "Không rõ") : "Còn sống"}
                            </p>
                        </div>

                        {/* Spouse */}
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-1 mb-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-heritage-gold/70">
                                    <circle cx="9" cy="12" r="4" />
                                    <circle cx="15" cy="12" r="4" />
                                </svg>
                                <span className="text-[10px] uppercase font-bold text-heritage-gold/80 tracking-wider">Phối</span>
                            </div>
                            <p className="text-[11px] text-foreground/80 leading-tight">
                                {spouseNames || "—"}
                            </p>
                        </div>
                    </div>

                    {/* Biography / Notes */}
                    {meta.notes && (
                        <div className="mt-5 w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-[1px] flex-1 bg-heritage-gold-dim/20" />
                                <span className="text-[10px] uppercase font-bold text-heritage-gold/60 tracking-wider">Tiểu Sử</span>
                                <div className="h-[1px] flex-1 bg-heritage-gold-dim/20" />
                            </div>
                            <p className="text-sm text-foreground/70 leading-relaxed line-clamp-4">
                                {meta.notes}
                            </p>
                        </div>
                    )}

                    {/* Action button */}
                    <Link
                        href={`/people/${member.id}`}
                        className="mt-5 px-6 py-2.5 rounded-lg border border-heritage-gold/40 bg-heritage-gold/10 text-heritage-gold text-sm font-semibold hover:bg-heritage-gold/20 hover:border-heritage-gold/60 transition-all"
                        aria-label={`Xem trang đầy đủ của ${member.full_name}`}
                    >
                        Xem đầy đủ →
                    </Link>
                </div>
            </div>
        </div>
    );
}
