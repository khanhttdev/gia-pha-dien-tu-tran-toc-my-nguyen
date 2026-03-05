"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Member } from "@/lib/types";
import { getMeta } from "@/lib/tree-utils";
import { MemberMetadata } from "@/lib/types";

type RootSelectorProps = {
    members: Member[];
    currentRootId: string | null;
    onRootChange: (memberId: string | null) => void;
};

export function RootSelector({ members, currentRootId, onRootChange }: RootSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Current root info
    const currentRoot = useMemo(() => {
        if (!currentRootId) {
            // Find default root (no father_id, lowest generation_level)
            const roots = members.filter((m) => !m.father_id);
            return roots.sort((a, b) => a.generation_level - b.generation_level)[0] || members[0];
        }
        return members.find((m) => m.id === currentRootId) || members[0];
    }, [currentRootId, members]);

    const currentMeta = currentRoot ? (currentRoot.metadata as MemberMetadata) ?? {} : {};

    // Filtered members list
    const filteredMembers = useMemo(() => {
        if (!search.trim()) return members;
        const q = search.toLowerCase();
        return members.filter((m) => m.full_name.toLowerCase().includes(q));
    }, [members, search]);

    if (!currentRoot) return null;

    return (
        <div ref={dropdownRef} className="absolute top-4 left-4 z-30">
            {/* Selected Root Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-heritage-gold/30 bg-card/80 backdrop-blur-md hover:border-heritage-gold/60 transition-all shadow-lg min-w-[200px]"
                aria-label="Chọn Gốc Hiển Thị"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-heritage-gold/10 flex items-center justify-center text-heritage-gold text-xs font-bold ring-1 ring-heritage-gold/30 shrink-0">
                    {currentMeta.avatar_url ? (
                        <img src={currentMeta.avatar_url} alt={currentRoot.full_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-heritage-gold/70">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-heritage-gold-dim/60 font-semibold leading-none mb-0.5">
                        Gốc hiển thị
                    </p>
                    <p className="text-sm font-serif font-bold text-foreground truncate leading-tight">
                        {currentRoot.full_name}
                        {currentMeta.birth_year && (
                            <span className="text-muted-foreground font-normal ml-1">({currentMeta.birth_year})</span>
                        )}
                    </p>
                </div>

                {/* Chevron */}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 max-h-80 rounded-xl border border-heritage-gold-dim/30 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search */}
                    <div className="p-3 border-b border-border/40">
                        <input
                            type="text"
                            placeholder="Tìm theo tên..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-background/60 border border-border/50 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-heritage-gold/50 transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Reset option */}
                    {currentRootId && (
                        <button
                            onClick={() => {
                                onRootChange(null);
                                setIsOpen(false);
                                setSearch("");
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-heritage-gold hover:bg-heritage-gold/10 flex items-center gap-2 border-b border-border/20 transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                            Về Thủy Tổ (mặc định)
                        </button>
                    )}

                    {/* Members list */}
                    <div className="overflow-y-auto max-h-52">
                        {filteredMembers.map((m) => {
                            const mMeta = (m.metadata as MemberMetadata) ?? {};
                            const isSelected = m.id === (currentRootId || currentRoot?.id);
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        onRootChange(m.id);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-muted/30 transition-colors ${isSelected ? "bg-heritage-gold/10" : ""
                                        }`}
                                >
                                    <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${m.gender === "male"
                                            ? "bg-heritage-gold/10 text-heritage-gold"
                                            : "bg-pink-500/10 text-pink-400"
                                        }`}>
                                        {mMeta.avatar_url ? (
                                            <img src={mMeta.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            m.full_name.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{m.full_name}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Đời {m.generation_level}
                                            {mMeta.birth_year && ` • ${mMeta.birth_year}`}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-heritage-gold shrink-0">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                        {filteredMembers.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">Không tìm thấy</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
