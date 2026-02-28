"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { PersonNode as PersonNodeType } from "@/lib/tree-layout";
import { MemberMetadata } from "@/lib/types";
import { cn } from "@/lib/utils";

function ProfileBlock({ member }: { member: any }) {
  const meta = (member?.metadata as MemberMetadata) || {};
  const isMale = member?.gender === "male";
  const isFemale = member?.gender === "female";
  const isAlive = meta.is_alive !== false;
  const yearRange = [meta.birth_year, meta.death_year]
    .filter(Boolean)
    .join(" – ");

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-3 px-3 py-2 w-[220px] group/profile transition-all duration-300",
        !isAlive && "opacity-70",
      )}
    >
      {/* Avatar Circle with Premium Gold Ring - Compact Size */}
      <div
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 transition-all duration-500 ring-[1.5px] ring-offset-[2px] ring-offset-[#0B0E14]",
          "bg-[#0D0202] overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)]",
          isMale
            ? "ring-[#4B6B99]"
            : isFemale
              ? "ring-[#C5A365]"
              : "ring-amber-500/50",
        )}
      >
        {meta.avatar_url ? (
          <img
            src={meta.avatar_url}
            alt={member.full_name}
            width={44}
            height={44}
            className="w-full h-full object-cover grayscale-[20%] group-hover/profile:grayscale-0 transition-all duration-500"
          />
        ) : isMale ? (
          "👨"
        ) : isFemale ? (
          "👩"
        ) : (
          "👤"
        )}
      </div>

      <div className="flex flex-col items-start min-w-0 justify-center">
        <h3 className="text-[11px] font-black text-[#E8D9A8] leading-tight tracking-[0.05em] uppercase font-serif line-clamp-2 mb-0.5">
          {member.full_name}
        </h3>

        {yearRange && (
          <p className="text-[9px] text-[#A68F55] font-semibold tracking-widest font-mono mb-1">
            {yearRange}
          </p>
        )}

        <div className="flex items-center gap-1.5">
          <div className="px-1.5 py-px rounded bg-white/5 border border-white/5">
            <span className="text-[8px] text-[#A68F55]/60 font-bold uppercase tracking-widest leading-none">
              {isAlive ? "Member" : "Ancestor"}
            </span>
          </div>
          {member.father_id === null && (
            <span className="text-[9px] drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">👑</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeType>) {
  const { member, spouses, isHighlighted, isActiveRoot } = data as any;
  const isAlive = (member.metadata as MemberMetadata)?.is_alive !== false;

  // Tạo danh sách kết hợp 1 người chồng + N người vợ
  const familyMembers = [member, ...(spouses || [])];

  return (
    <div
      className={cn(
        "rounded-xl border-[1px] transition-all duration-300 cursor-pointer group flex flex-col relative",
        "bg-[#0B0E14] shadow-[0_5px_15px_rgba(0,0,0,0.8)] outline outline-1 outline-offset-[-2px] outline-[#1A233A]",
        isActiveRoot
          ? "border-[#D4AF37] ring-[1px] ring-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.4)] z-30"
          : "border-[#D4AF37]/40",
        selected
          ? "border-[#F5D061] shadow-[0_0_25px_rgba(245,208,97,0.5)] z-20 bg-[#121824]"
          : isHighlighted
            ? "border-[#F5D061] z-10"
            : "hover:border-[#D4AF37]/80 hover:shadow-[0_8px_20px_rgba(212,175,55,0.2)]",
        !isAlive && spouses?.length === 0 && "opacity-90",
      )}
    >
      {/* Decorative inner corners like the House Deveraux image */}
      <div className="absolute top-[2px] left-[2px] w-[6px] h-[6px] border-t border-l border-[#D4AF37]/30 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-[2px] right-[2px] w-[6px] h-[6px] border-t border-r border-[#D4AF37]/30 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-[2px] left-[2px] w-[6px] h-[6px] border-b border-l border-[#D4AF37]/30 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-[2px] right-[2px] w-[6px] h-[6px] border-b border-r border-[#D4AF37]/30 rounded-br-sm pointer-events-none" />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-1.5 !h-1.5 !bg-[#D4AF37] !border-none !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div className="flex flex-row items-center justify-start p-1 min-h-[50px]">
        {familyMembers.map((person, index) => (
          <div
            key={person.id}
            className="flex flex-row items-center border-r border-[#D4AF37]/10 last:border-r-0 relative"
          >
            <ProfileBlock member={person} />

            {/* Horizontal connector line for spouses */}
            {index === 0 && familyMembers.length > 1 && (
              <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-2 h-0.5 bg-[#D4AF37]/50" />
            )}
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-1.5 !h-1.5 !bg-[#D4AF37] !border-none !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
