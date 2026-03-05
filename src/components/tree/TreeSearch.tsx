"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Member, MemberMetadata } from "@/lib/types";
import { Search, X } from "lucide-react";

type TreeSearchProps = {
    members: Member[];
    onSelectMember: (memberId: string) => void;
};

export function TreeSearch({ members, onSelectMember }: TreeSearchProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredMembers = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return members.filter((m) =>
            m.full_name.toLowerCase().includes(q)
        ).slice(0, 10); // Limit results to 10
    }, [members, query]);

    return (
        <div ref={dropdownRef} className="absolute top-4 right-4 z-30 w-72">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/60">
                    <Search className="h-4 w-4" />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm thành viên..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full pl-9 pr-8 py-2.5 bg-card/80 backdrop-blur-md border border-heritage-gold-dim/30 rounded-full text-sm text-foreground focus:outline-none focus:border-heritage-gold/60 focus:ring-1 focus:ring-heritage-gold/30 shadow-lg transition-all"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setIsOpen(false);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && query.trim() && (
                <div className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-xl border border-heritage-gold-dim/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredMembers.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto py-2">
                            {filteredMembers.map((member) => {
                                const meta = (member.metadata as MemberMetadata) ?? {};
                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => {
                                            onSelectMember(member.id);
                                            setIsOpen(false);
                                            setQuery(""); // Clear search after selection
                                        }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-heritage-gold/10 transition-colors border-b border-border/20 last:border-0"
                                    >
                                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ring-1 ring-heritage-gold/30 ${member.gender === "male"
                                            ? "bg-heritage-gold/10 text-heritage-gold"
                                            : "bg-pink-500/10 text-pink-400"
                                            }`}>
                                            {meta.avatar_url ? (
                                                <img src={meta.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                member.full_name.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-serif font-semibold text-foreground truncate leading-tight">
                                                {member.full_name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                                                Đời {member.generation_level}
                                                {meta.birth_year && ` • Sinh năm ${meta.birth_year}`}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Không tìm thấy kết quả phù hợp.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
