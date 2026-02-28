"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Member, MemberMetadata } from "@/lib/types";
import { Input } from "@/components/ui/input";

export function TreeSidebar({
    members,
    onSelectMember,
}: {
    members: Member[];
    onSelectMember: (m: Member) => void;
}) {
    const [searchTerm, setSearchTerm] = useState("");

    // Lọc Root Members để hiển thị Tree dọc
    const rootMembers = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (term) {
            // Nếu có search, trả về tất cả kết quả khớp không theo dạng cây
            return members.filter(m => m.full_name?.toLowerCase().includes(term));
        }
        // Không search, trả về cấu trúc cây từ gốc
        return members.filter(m => (!m.father_id && !m.mother_id) || m.id === members[0]?.id);
    }, [members, searchTerm]);

    return (
        <div className="absolute top-0 left-0 bottom-0 w-80 bg-black/50 backdrop-blur-xl border-r border-[var(--color-heritage-gold-dim)]/30 z-40 flex flex-col pt-16 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-heritage-gold-dim)]/20">
                <h2 className="font-serif text-[var(--color-heritage-gold)] text-lg mb-4 text-center tracking-widest uppercase font-bold">
                    Danh Sách Dòng Họ
                </h2>

                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm thành viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/30 border-[var(--color-heritage-gold-dim)]/50 text-[var(--color-heritage-gold)] placeholder:text-[var(--color-heritage-gold-dim)]/50 pl-10 h-10 rounded-full"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-heritage-gold-dim)]" />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {rootMembers.length === 0 ? (
                    <div className="text-center text-[var(--color-heritage-gold-dim)]/60 text-sm italic mt-10">
                        Không tìm thấy kết quả phù hợp.
                    </div>
                ) : searchTerm ? (
                    // Kết quả tìm kiếm phẳng
                    <div className="flex flex-col gap-2">
                        {rootMembers.map(m => (
                            <SidebarItem key={m.id} member={m} onClick={() => onSelectMember(m)} />
                        ))}
                    </div>
                ) : (
                    // Cây phân cấp
                    <div className="flex flex-col gap-1">
                        {rootMembers.map((root) => (
                            <RecursiveSidebarItem
                                key={root.id}
                                member={root}
                                allMembers={members}
                                level={0}
                                onSelect={onSelectMember}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SidebarItem({ member, onClick, style }: { member: Member, onClick: () => void, style?: React.CSSProperties }) {
    const meta = (member.metadata as MemberMetadata) || {};
    return (
        <div
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-heritage-gold)]/10 cursor-pointer transition-colors border border-transparent hover:border-[var(--color-heritage-gold)]/30 group"
            onClick={onClick}
            style={style}
        >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--color-heritage-gold-dim)] shrink-0 bg-black/50">
                {meta.avatar_url ? (
                    <Image src={meta.avatar_url} alt={member.full_name} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-heritage-gold-dim)]/50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" clipRule="evenodd" /></svg>
                    </div>
                )}
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="font-serif text-[13px] text-white/90 group-hover:text-[var(--color-heritage-gold)] transition-colors truncate">
                    {member.full_name}
                </span>
                <span className="text-[10px] text-[var(--color-heritage-gold-dim)] font-mono">
                    {meta.birth_year || "?"} - {meta.death_year || "Nay"} {member.generation_level && `• Đời ${member.generation_level}`}
                </span>
            </div>
        </div>
    )
}

function RecursiveSidebarItem({ member, allMembers, level, onSelect }: { member: Member, allMembers: Member[], level: number, onSelect: (m: Member) => void }) {
    const children = allMembers.filter(m => m.father_id === member.id || m.mother_id === member.id);
    // Default open for root level
    const [expanded, setExpanded] = useState(level === 0);

    return (
        <div className="flex flex-col w-full">
            <div className="relative group w-full flex items-center justify-between">
                <div className="flex-1" style={{ marginLeft: `${level * 12}px` }}>
                    <SidebarItem member={member} onClick={() => onSelect(member)} />
                </div>

                {children.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        className="w-6 h-6 flex items-center justify-center shrink-0 mr-1 text-[var(--color-heritage-gold-dim)] hover:text-[var(--color-heritage-gold)] hover:bg-white/5 rounded"
                    >
                        {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {expanded && children.length > 0 && (
                <div className="flex flex-col relative w-full mt-1">
                    {/* Connecting line */}
                    <div
                        className="absolute top-0 bottom-2 w-px bg-[var(--color-heritage-gold-dim)]/20"
                        style={{ left: `${(level + 1) * 12 + 20}px` }}
                    />
                    {children.map(child => (
                        <RecursiveSidebarItem key={child.id} member={child} allMembers={allMembers} level={level + 1} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
}
