"use client";

import { memo } from "react";
import { TreeMember, getMeta, getInitials } from "@/lib/tree-utils";
import { MemberMetadata, Spouse } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_WIDTH = 160;
const NODE_HEIGHT = 130;
const SPOUSE_GAP = 20;

export { NODE_WIDTH, NODE_HEIGHT };

type TreeMemberNodeProps = {
    member: TreeMember;
    x: number;
    y: number;
    hasHiddenChildren?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    onMemberClick?: (member: TreeMember) => void;
    onSpouseClick?: (spouse: Spouse, member: TreeMember) => void;
    isRoot?: boolean;
    isHighlighted?: boolean;
};

// ─── Premium "Royal Gold" Card ────────────────────────────────────────────
function MemberCard({
    fullName,
    meta,
    isMale,
    isRootNode,
    isHighlighted,
    onClick,
}: {
    fullName: string;
    meta: MemberMetadata;
    isMale: boolean;
    isRootNode?: boolean;
    isHighlighted?: boolean;
    onClick?: () => void;
}) {
    const isDeceased = meta.is_alive === false;
    let lifespan = "";
    if (meta.birth_year) {
        const death = isDeceased && meta.death_year ? meta.death_year : isDeceased ? "?" : "nay";
        lifespan = `${meta.birth_year} — ${death}`;
    }
    const initials = getInitials(fullName);

    return (
        <div
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-center
                w-[160px] h-[130px] px-2 py-3
                rounded-lg cursor-pointer select-none
                transition-all duration-500 ease-out
                border-[1.5px]
                ${isDeceased
                    ? "bg-gradient-to-br from-[#1a0507] to-[#0a0203] border-heritage-gold-dim/30 shadow-[0_4px_15px_rgba(0,0,0,0.6)]"
                    : "bg-gradient-to-br from-[#2d0a0e] to-[#150507] border-heritage-gold-dim/40 shadow-[0_8px_25px_rgba(0,0,0,0.7)]"
                }
                ${isHighlighted
                    ? "ring-4 ring-heritage-gold shadow-[0_0_50px_rgba(230,200,117,1)] border-heritage-gold scale-[1.08] z-50 animate-pulse"
                    : "hover:border-heritage-gold hover:shadow-[0_0_30px_rgba(230,200,117,0.4)] hover:scale-[1.05]"
                }
                group overflow-hidden
            `}
            role="button"
            tabIndex={0}
            aria-label={`Xem chi tiết ${fullName}`}
        >
            {/* Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-30" />

            {/* Ornamental SVG Corners */}
            <svg className="absolute top-1 left-1 w-6 h-6 text-heritage-gold/30 group-hover:text-heritage-gold/60 transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
                <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
            </svg>
            <svg className="absolute top-1 right-1 w-6 h-6 text-heritage-gold/30 group-hover:text-heritage-gold/60 transition-colors duration-500 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
                <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
            </svg>
            <svg className="absolute bottom-1 left-1 w-6 h-6 text-heritage-gold/30 group-hover:text-heritage-gold/60 transition-colors duration-500 -rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
                <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
            </svg>
            <svg className="absolute bottom-1 right-1 w-6 h-6 text-heritage-gold/30 group-hover:text-heritage-gold/60 transition-colors duration-500 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
                <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
            </svg>

            {/* Root badge */}
            {isRootNode && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 shadow-lg">
                    <div className="bg-gradient-to-r from-heritage-gold via-[#fef3c7] to-heritage-gold text-[7px] font-bold text-black px-3 py-0.5 rounded-full uppercase tracking-[0.15em] border border-black/20">
                        Thủy Tổ
                    </div>
                </div>
            )}

            {/* Avatar with Double Glowing Frame */}
            <div className="relative shrink-0 flex items-center justify-center p-1">
                {/* External Halo */}
                <div className={`absolute inset-0 rounded-full border border-heritage-gold/40 shadow-[0_0_12px_rgba(230,200,117,0.3)] group-hover:shadow-[0_0_20px_rgba(230,200,117,0.6)] animate-spin-slow`} />

                <div
                    className={`
                        relative flex items-center justify-center
                        w-[56px] h-[56px] rounded-full text-sm font-bold
                        ring-2 ring-offset-2 ring-origin-center
                        ${isMale
                            ? "ring-heritage-gold bg-gradient-to-tr from-heritage-gold/30 to-transparent text-heritage-gold"
                            : "ring-pink-400 bg-gradient-to-tr from-pink-400/30 to-transparent text-pink-400"
                        }
                        shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]
                        transition-all duration-500 group-hover:ring-offset-1
                    `}
                >
                    {meta.avatar_url ? (
                        <div className="w-full h-full p-0.5">
                            <img
                                src={meta.avatar_url}
                                alt={fullName}
                                width={56}
                                height={56}
                                loading="lazy"
                                className="w-full h-full rounded-full object-cover grayscale-[20%] sepia-[10%] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500 shadow-inner"
                            />
                        </div>
                    ) : (
                        <span className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">{initials}</span>
                    )}
                </div>
            </div>

            {/* Name and Text */}
            <div className="mt-2 flex flex-col items-center">
                <p
                    className={`
                        font-serif text-[13px] font-bold leading-tight text-center
                        max-w-[145px] truncate px-1
                        bg-clip-text text-transparent bg-gradient-to-b
                        ${isDeceased
                            ? "from-heritage-gold-dim/80 to-heritage-gold-dim"
                            : "from-[#fef3c7] via-heritage-gold to-[#d97706]"
                        }
                        drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                        group-hover:scale-[1.02] transition-transform duration-300
                    `}
                >
                    {fullName}
                </p>

                {/* Lifespan */}
                {lifespan && (
                    <p className="text-[9px] text-heritage-gold-dim/80 mt-1 font-mono tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
                        {lifespan}
                    </p>
                )}
            </div>
        </div>
    );
}

function TreeMemberNodeInner({
    member,
    x,
    y,
    hasHiddenChildren,
    isExpanded,
    onToggleExpand,
    onMemberClick,
    onSpouseClick,
    isRoot,
    isHighlighted,
}: TreeMemberNodeProps) {
    const meta = getMeta(member);
    const isMale = member.gender === "male";
    const spouses = member.spouses || [];

    const totalWidth = NODE_WIDTH + spouses.length * (NODE_WIDTH + SPOUSE_GAP);
    const hasAnyChildren = hasHiddenChildren || (member.children && member.children.length > 0);
    const centerX = totalWidth / 2;

    return (
        <foreignObject
            x={x - NODE_WIDTH / 2}
            y={y - NODE_HEIGHT / 2}
            width={totalWidth}
            height={NODE_HEIGHT + 30}
            style={{ overflow: "visible" }}
            className={isHighlighted ? "z-50" : "z-10"}
        >
            <div className="relative w-full h-full flex items-start">
                {/* Main Member Card */}
                <MemberCard
                    fullName={member.full_name}
                    meta={meta}
                    isMale={isMale}
                    isRootNode={isRoot}
                    isHighlighted={isHighlighted}
                    onClick={() => onMemberClick?.(member)}
                />

                {/* Spouses */}
                {spouses.map((spouse) => {
                    const spouseMeta = (spouse.metadata as MemberMetadata) ?? {};
                    const isSpouseMale = !isMale;
                    return (
                        <div key={spouse.id} className="relative flex items-center shrink-0">
                            {/* Wedding ring connector */}
                            <div className="w-[20px] flex items-center justify-center" style={{ marginTop: `${NODE_HEIGHT / 2}px`, transform: "translateY(-50%)" }}>
                                <div className="w-full h-[2px] bg-heritage-gold-dim/40 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#150808] p-0.5 rounded-full outline outline-1 outline-heritage-gold-dim/30 flex items-center justify-center">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-heritage-gold/70">
                                            <circle cx="9" cy="12" r="4.5" />
                                            <circle cx="15" cy="12" r="4.5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Spouse Card */}
                            <MemberCard
                                fullName={spouse.full_name}
                                meta={spouseMeta}
                                isMale={isSpouseMale}
                                onClick={() => onSpouseClick?.(spouse, member)}
                            />
                        </div>
                    );
                })}

                {/* Expand / Collapse Button */}
                {hasAnyChildren && !isRoot && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleExpand?.();
                        }}
                        className={`absolute bottom-0 z-20 flex items-center justify-center w-7 h-7 border-2 rounded-full cursor-pointer transition-all hover:scale-110 shadow-md
                            ${isHighlighted
                                ? "bg-heritage-gold border-heritage-gold text-background shadow-heritage-gold/50"
                                : "bg-[#1a0a0a] hover:bg-[#2a0f0f] border-heritage-gold/50 text-heritage-gold hover:border-heritage-gold"
                            }`}
                        style={{ left: `${centerX}px`, transform: "translate(-50%, 60%)" }}
                        title={isExpanded ? "Thu gọn" : "Mở rộng"}
                        aria-label={isExpanded ? "Thu gọn nhánh" : "Mở rộng nhánh"}
                    >
                        {isExpanded ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </foreignObject>
    );
}

export const TreeMemberNode = memo(TreeMemberNodeInner);
