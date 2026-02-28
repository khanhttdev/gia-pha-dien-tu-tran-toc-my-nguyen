"use client";
import { useState } from "react";
import Image from "next/image";
import { Member, Spouse, MemberMetadata } from "@/lib/types";
import { MemberProfileModal } from "@/components/tree/member-profile-modal";

export function TreeMobile({
    members,
    spouses,
    defaultRootId,
}: {
    members: Member[];
    spouses: Spouse[];
    defaultRootId?: string | null;
}) {
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    // Tìm node gốc
    const rootMembers = defaultRootId
        ? members.filter(m => m.id === defaultRootId)
        : members.filter(m => !m.father_id && !m.mother_id);

    if (rootMembers.length === 0 && members.length > 0) {
        rootMembers.push(members[0]);
    }

    return (
        <div className="w-full h-full bg-[var(--color-heritage-maroon)] text-[var(--color-heritage-gold)] overflow-y-auto px-2 py-6 pb-24">
            <h2 className="font-serif text-2xl text-center mb-6 font-bold tracking-wider">
                DANH SÁCH GIA PHẢ
            </h2>
            <div className="flex flex-col gap-2">
                {rootMembers.map((root) => (
                    <MobileNode
                        key={root.id}
                        member={root}
                        members={members}
                        spouses={spouses}
                        level={0}
                        onSelect={setSelectedMember}
                    />
                ))}
            </div>

            <MemberProfileModal
                member={selectedMember}
                spouses={spouses}
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
            />
        </div>
    );
}

function MobileNode({
    member,
    members,
    spouses,
    level,
    onSelect,
}: {
    member: Member;
    members: Member[];
    spouses: Spouse[];
    level: number;
    onSelect: (m: Member) => void;
}) {
    const [expanded, setExpanded] = useState(level < 1); // Expand level 0 default
    const children = members.filter(
        (m) => m.father_id === member.id || m.mother_id === member.id
    );
    const meta = (member.metadata as MemberMetadata) || {};

    return (
        <div className="w-full flex flex-col">
            {/* Node Card */}
            <div
                className={`relative flex items-center justify-between p-3 rounded-xl border border-[var(--color-heritage-gold-dim)] bg-black/20 backdrop-blur-sm transition-all cursor-pointer ${expanded ? "border-[var(--color-heritage-gold)] bg-black/40 shadow-[0_0_10px_rgba(230,200,117,0.15)]" : ""
                    }`}
                style={{ marginLeft: `${level * 16}px` }}
                onClick={() => onSelect(member)}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--color-heritage-gold)] shrink-0 bg-black/50 flex flex-col items-center justify-center">
                        {meta.avatar_url ? (
                            <Image src={meta.avatar_url} alt={member.full_name} width={48} height={48} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[var(--color-heritage-gold-dim)] opacity-50"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                        )}
                    </div>
                    <div className="flex flex-col truncate">
                        <h3 className="font-serif font-bold text-sm uppercase truncate text-white">
                            {member.full_name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--color-heritage-gold-dim)] mt-0.5 font-mono">
                            <span>{meta.birth_year || "?"} - {meta.death_year || ""}</span>
                            {member.generation_level && <span className="bg-[var(--color-heritage-gold-dim)]/20 px-1.5 py-0.5 rounded text-[10px]">Đời {member.generation_level}</span>}
                        </div>
                    </div>
                </div>

                {children.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-heritage-gold-dim)]/20 text-[var(--color-heritage-gold)] hover:bg-[var(--color-heritage-gold)] hover:text-black transition-colors shrink-0"
                        aria-label={expanded ? "Thu gọn phân nhánh" : "Mở rộng phân nhánh"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Children list */}
            {expanded && children.length > 0 && (
                <div className="flex flex-col gap-2 mt-2 relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-6 top-0 bottom-4 w-px bg-[var(--color-heritage-gold-dim)]/30" style={{ left: `${level * 16 + 24}px` }} />

                    {children.map((child) => (
                        <MobileNode key={child.id} member={child} members={members} spouses={spouses} level={level + 1} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
}
