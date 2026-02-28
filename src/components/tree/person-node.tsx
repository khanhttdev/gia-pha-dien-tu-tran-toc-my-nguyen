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
        "flex flex-row items-center gap-6 px-6 py-5 w-[300px] group/profile transition-all duration-500",
        !isAlive && "opacity-70",
      )}
    >
      {/* Avatar Circle with Premium Gold Ring - 80x80 Retina Size */}
      <div
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center text-4xl shrink-0 transition-all duration-700 ring-[2px] ring-offset-4 ring-offset-[#1B0506]",
          "bg-[#0D0202] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]",
          isMale
            ? "ring-blue-400/50"
            : isFemale
              ? "ring-pink-400/50"
              : "ring-amber-500/40",
        )}
      >
        {meta.avatar_url ? (
          <img
            src={meta.avatar_url}
            alt={member.full_name}
            width={80}
            height={80}
            className="w-full h-full object-cover grayscale-[10%] group-hover/profile:grayscale-0 transition-all duration-700 scale-105 group-hover/profile:scale-110"
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
        <h3 className="text-[15px] md:text-base font-black text-amber-50 leading-tight tracking-wide drop-shadow-md uppercase font-serif line-clamp-2 mb-1">
          {member.full_name}
        </h3>

        {yearRange && (
          <p className="text-[12px] text-amber-500/80 font-bold tracking-[0.1em] font-mono mb-2">
            {yearRange}
          </p>
        )}

        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            <span className="text-[9px] text-amber-200/50 font-black uppercase tracking-[0.2em] leading-none">
              {isAlive ? "Member" : "Ancestor"}
            </span>
          </div>
          {member.father_id === null && (
            <span className="text-[10px] animate-pulse">👑</span>
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
        "rounded-2xl border-[2px] transition-all duration-700 cursor-pointer group flex flex-col relative",
        "bg-[#1B0506] shadow-[0_20px_80px_rgba(0,0,0,1)]",
        isActiveRoot
          ? "border-amber-400 ring-[3px] ring-amber-500/30 shadow-[0_0_60px_rgba(251,191,36,0.4)] z-30 scale-110"
          : "border-amber-600/20",
        selected
          ? "border-amber-300 shadow-[0_0_80px_rgba(251,191,36,0.6)] z-20 scale-[1.08] bg-[#2A0809]"
          : isHighlighted
            ? "border-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.5)] z-10 scale-[1.05]"
            : "hover:border-amber-500/60 hover:shadow-[0_15px_50px_rgba(245,158,11,0.4)]",
        !isAlive && spouses?.length === 0 && "opacity-90",
      )}
    >
      {/* Ornamental Corners - Giống ảnh mẫu */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/40 rounded-tl-[2px]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/40 rounded-tr-[2px]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/40 rounded-bl-[2px]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/40 rounded-br-[2px]" />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-amber-500 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Generation badge - Bo góc vuông chuẩn Chronicle */}
      <div className="absolute -top-3 left-3 z-10">
        <div className="text-[8px] font-black tracking-[0.2em] px-2 py-0.5 bg-[#F59E0B] text-[#1B0506] shadow-lg uppercase">
          GEN {member.generation_level}
        </div>
      </div>

      <div className="flex flex-row items-center justify-start p-1.5 min-h-[64px]">
        {familyMembers.map((person, index) => (
          <div
            key={person.id}
            className="flex flex-row items-center border-r border-amber-500/10 last:border-r-0"
          >
            <ProfileBlock member={person} />

            {/* Ring separator between primary member and spouses */}
            {index === 0 && familyMembers.length > 1 && (
              <div className="w-1 h-12 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent mx-1" />
            )}
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-amber-500 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
