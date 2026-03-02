"use client";

import { motion } from "framer-motion";
import { Users, Fingerprint, Flag } from "lucide-react";

export function TreeNavButtons() {
    const buttons = [
        { label: "Biểu tượng gia đình", icon: <Users size={16} /> },
        { label: "Nguồn cội", icon: <Fingerprint size={16} /> },
        { label: "Khởi đầu gia tộc", icon: <Flag size={16} /> },
    ];

    return (
        <div className="fixed bottom-10 left-10 z-[100] flex flex-col gap-3">
            {buttons.map((btn, idx) => (
                <motion.button
                    key={idx}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    whileHover={{ x: 10, backgroundColor: "var(--color-heritage-gold)" }}
                    className="flex items-center gap-3 px-4 py-2 bg-[#2a0a0f] border border-[var(--color-heritage-gold)]/50 rounded-lg shadow-xl group transition-all duration-300"
                >
                    <div className="p-1.5 rounded bg-[var(--color-heritage-gold)]/10 text-[var(--color-heritage-gold)] group-hover:text-[#2a0a0f] transition-colors">
                        {btn.icon}
                    </div>
                    <span className="font-serif text-[12px] uppercase tracking-wider text-[var(--color-heritage-gold)] group-hover:text-[#2a0a0f] font-bold">
                        {btn.label}
                    </span>
                </motion.button>
            ))}
        </div>
    );
}
