import { memo } from "react";
import { Handle, Position, NodeProps, type Node } from "@xyflow/react";
import Image from "next/image";
import { motion } from "framer-motion";

export type PersonNodeData = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  role?: string;
  isSpouse?: boolean;
  hasChildren?: boolean;
  spouses?: any[]; // Using any to avoid complex imports here, or use Spouse type
};

export type PersonNodeType = Node<PersonNodeData, "person">;

function PersonNodeComponent({ data }: NodeProps<PersonNodeType>) {
  const isSpouse = data.isSpouse;
  const isMale = !isSpouse; // Simplified for heritage display, or use gender if passed

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative flex flex-col items-center group cursor-pointer"
    >
      {/* Connector Handles */}
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-heritage-gold)] !w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Node Body - Circular/Oval Avatar Frame */}
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-[var(--color-heritage-gold)]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Border Ring */}
        <div className={`
          relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 p-1 shadow-2xl transition-all duration-300
          ${isSpouse
            ? "border-[var(--color-heritage-node-border-amber)] bg-[#2a0a0f]"
            : "border-[var(--color-heritage-node-border-green)] bg-[#1b0505]"}
          group-hover:border-[var(--color-heritage-gold)]
        `}>
          <div className="w-full h-full rounded-full overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500 bg-black/40">
            {data.avatarUrl ? (
              <Image
                src={data.avatarUrl}
                alt={data.name}
                fill
                className="object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-heritage-gold-dim)]/40">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 p-2 opacity-50"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
              </div>
            )}
          </div>
        </div>

        {/* Marriage Handle (Right/Left) */}
        {!isSpouse && (
          <Handle
            type="source"
            position={Position.Right}
            id="marriage-right"
            className="!bg-[var(--color-heritage-gold-dim)] !w-2 !h-2 !border-none !top-1/2 opacity-0 group-hover:opacity-100"
          />
        )}
        {isSpouse && (
          <Handle
            type="target"
            position={Position.Left}
            id="marriage-left"
            className="!bg-[var(--color-heritage-gold-dim)] !w-2 !h-2 !border-none !top-1/2 opacity-0 group-hover:opacity-100"
          />
        )}
      </div>

      {/* Label Box */}
      <div className="mt-3 flex flex-col items-center bg-[#2a0a0f]/90 border border-[var(--color-heritage-gold)]/20 px-3 py-1 rounded shadow-lg backdrop-blur-sm min-w-[120px]">
        <span className="font-serif text-[13px] font-bold text-[var(--color-heritage-gold)] whitespace-nowrap group-hover:text-white transition-colors">
          {data.name}
        </span>
        <span className="text-[10px] text-[var(--color-heritage-gold-dim)] font-mono opacity-80">
          {data.birthYear || "?"} — {data.deathYear || "N/A"}
        </span>
      </div>

      {/* Bottom handle for children */}
      {!isSpouse && data.hasChildren && (
        <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-heritage-gold)] !w-2 !h-2 !-bottom-1 opacity-0 group-hover:opacity-100" />
      )}
    </motion.div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
