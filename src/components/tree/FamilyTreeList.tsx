"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TreeMember, buildTreeHierarchy, getMeta } from "@/lib/tree-utils";
import { Member, Spouse, MemberMetadata } from "@/lib/types";
import { ChevronRight, ChevronDown } from "lucide-react";

type FamilyTreeListProps = {
    members: Member[];
    spouses: Spouse[];
};

function MemberListItem({ node, depth = 0 }: { node: any; depth?: number }) {
    const member = node.data as TreeMember;
    const [isExpanded, setIsExpanded] = useState(depth === 0);
    const meta = getMeta(member);
    const isDeceased = meta.is_alive === false;
    const isMale = member.gender === "male";
    const spouses = member.spouses || [];

    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col">
            {/* Member Row */}
            <div
                className={`flex items-center gap-3 p-3 border-b border-border/40 ${isExpanded ? "bg-muted/10" : "bg-card/40"}`}
                style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
            >
                {/* Expand Toggle */}
                {hasChildren ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-11 h-11 -ml-2 flex items-center justify-center rounded bg-background/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                    >
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                ) : (
                    <div className="w-11 h-11 -ml-2" /> /* spacer */
                )}

                {/* Avatar */}
                <div
                    className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold border ${isMale ? "bg-heritage-gold/10 text-heritage-gold border-heritage-gold/20" : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                        }`}
                >
                    {meta.avatar_url ? (
                        <img src={meta.avatar_url} alt={member.full_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span>{member.full_name.charAt(0)}</span>
                    )}
                </div>

                {/* Info */}
                <Link href={`/people/${member.id}`} className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className={`font-serif font-semibold text-sm truncate ${isDeceased ? "text-muted-foreground" : "text-foreground"}`}>
                        {member.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Đời {member.generation_level}</span>
                        {meta.birth_year && <span>• {meta.birth_year} - {isDeceased && meta.death_year ? meta.death_year : isDeceased ? "?" : "nay"}</span>}
                    </p>
                </Link>
            </div>

            {/* Spouses Row */}
            {spouses.map(spouse => {
                const spMeta = (spouse.metadata as MemberMetadata) ?? {};
                const spDeceased = spMeta.is_alive === false;
                const spMale = !isMale;
                return (
                    <div
                        key={spouse.id}
                        className="flex items-center gap-3 p-3 border-b border-border/20 bg-card/20"
                        style={{ paddingLeft: `${depth * 1.5 + 0.75 + 1.5}rem` }}
                    >
                        {/* Ring Icon indicator */}
                        <div className="w-[26px] flex justify-center text-heritage-gold/60">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="12" r="4.5" />
                                <circle cx="15" cy="12" r="4.5" />
                            </svg>
                        </div>

                        {/* Spouse Avatar */}
                        <div
                            className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold border ${spMale ? "bg-heritage-gold/10 text-heritage-gold border-heritage-gold/20" : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                                }`}
                        >
                            {spMeta.avatar_url ? (
                                <img src={spMeta.avatar_url} alt={spouse.full_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span>{spouse.full_name.charAt(0)}</span>
                            )}
                        </div>

                        {/* Spouse Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className={`font-serif font-semibold text-[13px] truncate ${spDeceased ? "text-muted-foreground" : "text-foreground"}`}>
                                {spouse.full_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                                <span>Phu / Thê</span>
                            </p>
                        </div>
                    </div>
                );
            })}

            {/* Children List */}
            {isExpanded && node.children && (
                <div className="flex flex-col">
                    {node.children.map((childNode: any) => (
                        <MemberListItem key={childNode.data.id} node={childNode} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function FamilyTreeList({ members, spouses }: FamilyTreeListProps) {
    const rootNode = useMemo(() => buildTreeHierarchy(members, spouses), [members, spouses]);

    if (!rootNode) {
        return (
            <div className="flex items-center justify-center w-full h-full p-6 text-center text-muted-foreground">
                Chưa có dữ liệu thành viên để hiển thị.
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-background pb-12">
            <div className="p-4 pt-6 border-b border-border/40 mb-2">
                <h1 className="text-xl font-serif text-heritage-gold mb-1">Cây Gia Phả</h1>
                <p className="text-sm text-muted-foreground">Danh sách theo cấu trúc gia đình (hierarchical)</p>
            </div>

            <div className="flex flex-col">
                <MemberListItem node={rootNode} />
            </div>
        </div>
    );
}
