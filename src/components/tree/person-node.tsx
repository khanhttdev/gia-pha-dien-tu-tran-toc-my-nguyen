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
};

export type PersonNodeType = Node<PersonNodeData, "person">;

function PersonNodeComponent({ data }: NodeProps<PersonNodeType>) {
  const isSpouse = data.isSpouse;

  return (
    <div className={`relative group w-64 p-3 rounded-lg border-2 transition-all duration-300 flex gap-3 items-center
      ${isSpouse
        ? "border-[var(--color-heritage-gold-dim)]/40 bg-[#1a0505] shadow-none opacity-90"
        : "border-[var(--color-heritage-gold-dim)] hover:border-[var(--color-heritage-gold)] bg-[var(--color-heritage-maroon)] shadow-[0_0_15px_rgba(230,200,117,0.1)] hover:shadow-[0_0_20px_rgba(230,200,117,0.3)]"
      }`}>

      {/* Handles: Bloodline (Vertical) */}
      <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full" style={{ background: 'transparent', border: 'none' }} />
      <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full" style={{ background: 'transparent', border: 'none', bottom: -5 }} />

      {/* Handles: Marriage (Horizontal) */}
      <Handle type="source" position={Position.Right} id="marriage-right" className="opacity-0" style={{ right: -4, top: '50%' }} />
      <Handle type="target" position={Position.Left} id="marriage-left" className="opacity-0" style={{ left: -4, top: '50%' }} />

      {/* Avatar */}
      <div className={`rounded-full overflow-hidden border-2 shrink-0 bg-black/40 flex items-center justify-center transition-all
        ${isSpouse ? "w-12 h-12 border-[var(--color-heritage-gold-dim)]/50" : "w-14 h-14 border-[var(--color-heritage-gold)]"}
      `}>
        {data.avatarUrl ? (
          <Image
            src={data.avatarUrl}
            alt={data.name}
            width={isSpouse ? 48 : 56}
            height={isSpouse ? 48 : 56}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${isSpouse ? "w-6 h-6" : "w-8 h-8"} text-[var(--color-heritage-gold-dim)] opacity-50`}><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <h3 className={`font-serif font-bold uppercase truncate ${isSpouse ? "text-[13px] text-[var(--color-heritage-gold-dim)]" : "text-sm text-[var(--color-heritage-gold)]"}`} title={data.name}>
          {data.name}
        </h3>
        <p className="text-[10px] text-white/60 mt-0.5 font-mono tracking-wider">
          {data.birthYear ? data.birthYear : "?"} - {data.deathYear ? data.deathYear : ""}
        </p>
        {!isSpouse && data.role && (
          <p className="text-[10px] text-[var(--color-heritage-gold-dim)] uppercase mt-0.5 font-semibold tracking-widest truncate">
            {data.role}
          </p>
        )}
      </div>

      {!isSpouse && data.hasChildren && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-[var(--color-heritage-maroon)] border border-[var(--color-heritage-gold-dim)] rounded-full flex items-center justify-center text-[var(--color-heritage-gold)] hover:bg-[var(--color-heritage-gold)] hover:text-[var(--color-heritage-maroon)] cursor-pointer transition-colors z-10" title="Mở rộng nhánh con">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
      )}
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
