"use client";

import { motion } from "framer-motion";

export function TreeDecorations() {
    const tabs = [
        { label: "BIỂU TƯỢNG GIA ĐÌNH", color: "#8b4513", top: "10%", left: "40px" },
        { label: "NGUỒN CỘI", color: "#d2691e", top: "16%", left: "40px" },
        { label: "KHỞI ĐẦU GIA TỘC", color: "#228b22", bottom: "10%", left: "10%" },
        { label: "NGƯỜI SÁNG LẬP", color: "#cd853f", bottom: "10%", right: "10%" },
    ];

    return (
        <>
            <div className="absolute inset-0 pointer-events-none">
                {tabs.map((tab, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.5 + idx * 0.2 }}
                        className="absolute px-4 py-2 rounded-sm shadow-md border border-white/20 text-[10px] font-bold text-white flex items-center justify-center"
                        style={{
                            backgroundColor: tab.color,
                            top: tab.top,
                            bottom: tab.bottom,
                            left: tab.left,
                            right: tab.right,
                            transform: 'rotate(-2deg)'
                        }}
                    >
                        {tab.label}
                    </motion.div>
                ))}
            </div>

            {/* Ornate Vines or small birds could be added here */}
        </>
    );
}

export function GenerationLabel({ text, y }: { text: string, y: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-[50%] translate-x-[400px] z-10"
            style={{ top: y }}
        >
            <div className="relative px-6 py-1 bg-amber-100/90 border-y border-amber-900/30 text-[10px] font-bold text-amber-900 rounded-full shadow-sm">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-900 animate-pulse" />
                {text}
            </div>
        </motion.div>
    );
}
