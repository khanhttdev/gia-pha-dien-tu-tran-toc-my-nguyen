"use client";

import { motion } from "framer-motion";

interface GenerationBadgeProps {
    level: number;
    label?: string;
}

export function GenerationBadge({ level, label }: GenerationBadgeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 py-1 px-4 rounded-full bg-[#2a0a0f]/80 border border-[var(--color-heritage-gold)]/30 backdrop-blur-sm shadow-lg whitespace-nowrap"
        >
            <div className="w-8 h-8 rounded-full border border-[var(--color-heritage-gold)] flex items-center justify-center text-[var(--color-heritage-gold)] font-serif text-sm font-bold">
                {level}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-[var(--color-heritage-gold-dim)] uppercase tracking-widest font-bold leading-none">
                    Thế hệ
                </span>
                <span className="text-xs text-[var(--color-heritage-gold)] font-serif font-medium">
                    {label || (level === 1 ? "Thủy tổ / Tiên tổ" : `Đời thứ ${level}`)}
                </span>
            </div>
        </motion.div>
    );
}
