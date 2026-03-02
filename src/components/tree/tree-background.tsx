"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Branch {
    id: string;
    path: string;
    delay: number;
}

export function TreeBackground() {
    // Static organic tree base (Trunk and main branches)
    // In a real scenario, this could be more dynamic.
    const mainBranches: Branch[] = useMemo(() => [
        {
            id: "trunk",
            path: "M 500 1000 C 500 800 480 600 500 400", // Central Trunk
            delay: 0,
        },
        {
            id: "branch-L1",
            path: "M 495 700 C 400 650 300 680 200 600",
            delay: 0.5,
        },
        {
            id: "branch-R1",
            path: "M 505 750 C 600 700 750 720 850 650",
            delay: 0.7,
        },
        {
            id: "branch-L2",
            path: "M 498 550 C 420 500 350 450 250 400",
            delay: 1.2,
        },
        {
            id: "branch-R2",
            path: "M 502 500 C 580 450 650 400 750 350",
            delay: 1.4,
        },
    ], []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-30">
            <svg
                viewBox="0 0 1000 1000"
                className="w-full h-full"
                preserveAspectRatio="xMidYMax meet"
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Tree Trunk & Main Branches */}
                <g filter="url(#glow)">
                    {mainBranches.map((branch) => (
                        <motion.path
                            key={branch.id}
                            d={branch.path}
                            fill="none"
                            stroke="var(--color-heritage-trunk)"
                            strokeWidth={branch.id === "trunk" ? 12 : 6}
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                duration: 2.5,
                                delay: branch.delay,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </g>

                {/* Decorative Leaves/Details (Abstract) */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 2, duration: 2 }}
                >
                    <circle cx="200" cy="600" r="40" fill="var(--color-heritage-leaf)" opacity="0.2" />
                    <circle cx="850" cy="650" r="50" fill="var(--color-heritage-leaf)" opacity="0.2" />
                    <circle cx="250" cy="400" r="30" fill="var(--color-heritage-leaf)" opacity="0.2" />
                    <circle cx="750" cy="350" r="45" fill="var(--color-heritage-leaf)" opacity="0.2" />
                </motion.g>
            </svg>
        </div>
    );
}
