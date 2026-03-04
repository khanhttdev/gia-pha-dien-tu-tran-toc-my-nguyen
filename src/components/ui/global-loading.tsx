"use client";

import { motion } from "framer-motion";
import { TreePine } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalLoading({ fullScreen = true }: { fullScreen?: boolean }) {
    // Tránh hydration mismatch bằng cách chỉ render animation sau khi mount
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const containerClasses = fullScreen
        ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl"
        : "flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-background/30 backdrop-blur-sm rounded-3xl";

    return (
        <div className={containerClasses} role="status" aria-label="Loading">
            {/* Vòng sáng ngoài cùng */}
            <motion.div
                className="absolute w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="relative flex items-center justify-center w-24 h-24 mb-6 drop-shadow-2xl">
                {/* Vòng quay bên ngoài */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400/80 border-r-amber-400/30"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Vòng quay bên trong (ngược chiều) */}
                <motion.div
                    className="absolute inset-2 rounded-full border-2 border-transparent border-b-amber-600/60 border-l-amber-600/20"
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Icon trung tâm */}
                <motion.div
                    className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full glass bg-black/40 border border-amber-500/30"
                    animate={{
                        scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <TreePine className="w-6 h-6 text-amber-400" />
                </motion.div>
            </div>

            <motion.div
                className="flex flex-col items-center gap-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="font-serif font-bold text-lg text-foreground/90 tracking-widest gold-text text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                    TRẦN TỘC
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">
                    Đang tải dữ liệu...
                </span>
            </motion.div>
        </div>
    );
}
