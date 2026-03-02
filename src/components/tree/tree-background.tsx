"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

// Static random data generated outside the component to ensure purity
const FOLIAGE_DATA = [...Array(30)].map((_, i) => ({
    cx: 150 + Math.random() * 700,
    cy: 100 + Math.random() * 500,
    r: 10 + Math.random() * 40,
    delay: 2 + Math.random() * 3,
}));

const FLOWER_DATA = [...Array(15)].map((_, i) => ({
    cx: 200 + Math.random() * 600,
    cy: 150 + Math.random() * 450,
    delay: 4 + Math.random() * 2,
}));

export function TreeBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
            <svg width="1000" height="1000" viewBox="0 0 1000 1000" className="opacity-40">
                <defs>
                    <filter id="foliage-blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
                    </filter>
                </defs>

                {/* Dense Canopy Base - Sage Green cloud shapes */}
                <motion.path
                    d="M100,400 Q200,100 500,150 T900,400 Q950,600 700,750 T300,750 Q50,600 100,400"
                    fill="var(--color-heritage-leaf-sage)"
                    fillOpacity="0.3"
                    filter="url(#foliage-blur)"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 4 }}
                />

                {/* Artistic Trunk and main branches */}
                <motion.path
                    d="M500,1000 C500,850 450,700 350,600 C250,500 100,400 100,200"
                    stroke="var(--color-heritage-trunk)"
                    strokeWidth="35"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                />
                <motion.path
                    d="M500,850 C550,750 750,650 850,550 C950,450 900,300 800,150"
                    stroke="var(--color-heritage-trunk)"
                    strokeWidth="25"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
                />

                {/* Foliage details - scattered dots and smaller clouds */}
                {FOLIAGE_DATA.map((item, i) => (
                    <motion.circle
                        key={i}
                        cx={item.cx}
                        cy={item.cy}
                        r={item.r}
                        fill="var(--color-heritage-leaf-sage)"
                        fillOpacity="0.15"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: item.delay }}
                    />
                ))}

                {/* Flowers - White petals */}
                {FLOWER_DATA.map((item, i) => (
                    <motion.g
                        key={`flower-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: item.delay }}
                    >
                        <circle cx={item.cx} cy={item.cy} r="6" fill="#fff" fillOpacity="0.7" />
                        <circle cx={item.cx} cy={item.cy} r="3" fill="#ffcc00" />
                    </motion.g>
                ))}

                {/* Decorative Birds (Simplified SVG Paths) */}
                <motion.path
                    d="M200,300 Q210,290 220,300 Q210,310 200,300"
                    stroke="#4a90e2"
                    fill="none"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 0.4, x: 0 }}
                    transition={{ delay: 6, duration: 2 }}
                />
                <motion.path
                    d="M800,250 Q810,240 820,250 Q810,260 800,250"
                    stroke="#4a90e2"
                    fill="none"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 0.4, x: 0 }}
                    transition={{ delay: 6.5, duration: 2 }}
                />
            </svg>
        </div>
    );
}
