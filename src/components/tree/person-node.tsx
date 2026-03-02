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
    <div className={`relative group transition-all duration-500 flex flex-col items-center justify-center
      ${isSpouse
        ? "w-40 h-40 scale-90 opacity-80"
        : "w-48 h-48 animate-fruit-bloom animate-fruit-ripen"
      }`}>

      {/* Target/Source Handles (Hidden but functional) */}
      <Handle type="target" position={Position.Top} className="opacity-0" style={{ top: 0 }} />
      <Handle type="source" position={Position.Bottom} className="opacity-0" style={{ bottom: 0 }} />
      <Handle type="source" position={Position.Right} id="marriage-right" className="opacity-0" style={{ right: 0, top: '50%' }} />
      <Handle type="target" position={Position.Left} id="marriage-left" className="opacity-0" style={{ left: 0, top: '50%' }} />

      {/* Fruit Body */}
      <div className={`relative w-full h-full rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] border-4 overflow-hidden shadow-2xl transition-all duration-500 flex flex-col items-center justify-center p-4
        ${isSpouse
          ? "border-[var(--color-heritage-gold-dim)]/40 bg-[#1a0505]"
          : "border-[var(--color-heritage-gold)] bg-[var(--color-heritage-maroon)] group-hover:bg-[var(--color-heritage-crimson)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_15px_40px_rgba(230,200,117,0.2)]"
        }`}>

        {/* Stem (Cuống quả) */}
        {!isSpouse && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-[var(--color-heritage-trunk)] rounded-full -translate-y-2 group-hover:scale-y-110 transition-transform origin-bottom" />
        )}

        {/* Avatar */}
        <div className={`rounded-full overflow-hidden border-2 shrink-0 bg-black/40 flex items-center justify-center mb-2 transition-all duration-500
          ${isSpouse ? "w-16 h-16 border-[var(--color-heritage-gold-dim)]/50" : "w-20 h-20 border-[var(--color-heritage-gold)] group-hover:scale-105"}
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${isSpouse ? "w-8 h-8" : "w-10 h-10"} text-[var(--color-heritage-gold-dim)] opacity-40`}><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
          )}
        </div>

        {/* Info */}
        <div className="text-center w-full px-2">
          <h3 className={`font-serif font-bold uppercase truncate leading-tight ${isSpouse ? "text-xs text-[var(--color-heritage-gold-dim)]" : "text-sm text-[var(--color-heritage-gold)]"}`} title={data.name}>
            {data.name}
          </h3>
          <p className="text-[10px] text-white/50 font-mono tracking-tighter mt-1">
            {data.birthYear ? data.birthYear : "?"} - {data.deathYear ? data.deathYear : ""}
          </p>
        </div>

        {/* Shine effect (Glow) */}
        {!isSpouse && (
          <div className="absolute top-4 left-4 w-8 h-4 bg-white/10 rounded-full blur-md -rotate-45 pointer-events-none" />
        )}
      </div>

      {/* Expand Button */}
      {!isSpouse && data.hasChildren && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-[var(--color-heritage-gold)] border border-[var(--color-heritage-gold-dim)] rounded-full flex items-center justify-center text-[var(--color-heritage-maroon)] hover:bg-white hover:scale-110 cursor-pointer transition-all z-20 shadow-lg" title="Mở rộng hậu duệ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
      )}
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
