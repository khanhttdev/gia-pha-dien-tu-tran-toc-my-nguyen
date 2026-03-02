"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, type Node } from "@xyflow/react";
import Image from "next/image";

export type PersonNodeData = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role?: string;
  birthYear?: number | null;
  deathYear?: number | null;
  isSpouse?: boolean;
  hasChildren?: boolean;
  is_alive?: boolean;
};

export type PersonNodeType = Node<PersonNodeData, "person">;

function PersonNodeComponent({ data }: NodeProps<PersonNodeType>) {
  const isSpouse = data.isSpouse;

  return (
    <div className={`relative group transition-all duration-500 flex flex-col items-center justify-center
      ${isSpouse
        ? "w-40 h-40 scale-90 opacity-90"
        : "w-48 h-48 animate-fruit-bloom animate-fruit-ripen"
      }`}>

      {/* Target/Source Handles (Hidden but functional) */}
      <Handle type="target" position={Position.Top} className="opacity-0" style={{ top: 0 }} />
      <Handle type="source" position={Position.Bottom} className="opacity-0" style={{ bottom: 0 }} />
      <Handle type="source" position={Position.Right} id="marriage-right" className="opacity-0" style={{ right: 0, top: '50%' }} />
      <Handle type="target" position={Position.Left} id="marriage-left" className="opacity-0" style={{ left: 0, top: '50%' }} />

      {/* Fruit Body - Brighter highlights for visibility on maroon */}
      <div className={`relative w-full h-full rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] border-4 overflow-hidden shadow-2xl transition-all duration-500 flex flex-col items-center justify-center p-4
        ${isSpouse
          ? "border-[var(--color-heritage-gold-dim)]/30 bg-[#2a0d0d]"
          : "border-[var(--color-heritage-gold)] bg-[#4a141b] group-hover:bg-[#5d1a22] shadow-[0_10px_40px_rgba(0,0,0,0.6)] group-hover:shadow-[0_15px_50px_rgba(230,200,117,0.3)]"
        }`}>

        {/* Stem (Cuống quả) */}
        {!isSpouse && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8 bg-[#3d2b1f] rounded-full -translate-y-3 group-hover:scale-y-110 transition-transform origin-bottom" />
        )}

        {/* Avatar */}
        <div className={`rounded-full overflow-hidden border-2 shrink-0 bg-black/50 flex items-center justify-center mb-2 transition-all duration-500
          ${isSpouse ? "w-16 h-16 border-[var(--color-heritage-gold-dim)]/40" : "w-20 h-20 border-[var(--color-heritage-gold)] group-hover:scale-110"}
        `}>
          {data.avatarUrl ? (
            <Image
              src={data.avatarUrl}
              alt={data.name}
              width={isSpouse ? 64 : 80}
              height={isSpouse ? 64 : 80}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[var(--color-heritage-gold)] text-2xl font-bold">
                {data.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info - High visibility ivory text */}
        <div className="text-center w-full px-2">
          <h3 className={`font-serif font-bold uppercase truncate leading-tight ${isSpouse ? "text-[10px] text-[var(--color-heritage-gold-dim)]" : "text-xs text-[var(--color-heritage-gold)] group-hover:text-white"}`} title={data.name}>
            {data.name}
          </h3>
          <p className="text-[10px] text-[var(--foreground)]/70 font-mono tracking-tighter mt-1">
            {data.birthYear ? data.birthYear : "?"} - {data.deathYear ? data.deathYear : (data.is_alive ? "" : "?")}
          </p>
        </div>

        {/* Shine effect (Glow) */}
        {!isSpouse && (
          <div className="absolute top-4 left-4 w-10 h-5 bg-white/5 rounded-full blur-xl -rotate-45 pointer-events-none" />
        )}
      </div>

      {/* Expand Button */}
      {!isSpouse && data.hasChildren && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-[var(--color-heritage-gold)] border-2 border-[var(--color-heritage-gold-dim)] rounded-full flex items-center justify-center text-[#4a141b] hover:bg-white hover:scale-125 cursor-pointer transition-all z-20 shadow-xl" title="Mở rộng hậu duệ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
      )}
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
