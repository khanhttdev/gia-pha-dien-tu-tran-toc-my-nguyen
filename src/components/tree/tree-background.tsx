"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

// Static random data for high-contrast Bã Trầu theme
const FOLIAGE_DATA = [...Array(40)].map((_, i) => ({
    cx: 100 + Math.random() * 800,
    cy: 50 + Math.random() * 500,
    r: 15 + Math.random() * 60,
    delay: 1 + Math.random() * 2,
}));

const FLOWER_DATA = [...Array(12)].map((_, i) => ({
    cx: 150 + Math.random() * 700,
    cy: 100 + Math.random() * 450,
    delay: 3 + Math.random() * 1.5,
}));

export function TreeBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-end justify-center">
            <svg width="1200" height="1000" viewBox="0 0 1000 1000" className="opacity-90">
                <defs>
                    <filter id="foliage-blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
                    </filter>
                    <linearGradient id="trunk-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4a5d23" />
                        <stop offset="50%" stopColor="#2d3a1a" />
                        <stop offset="100%" stopColor="#1a0d0d" />
                    </linearGradient>
                </defs>

                {/* Grounding Base / Grass */}
                <motion.ellipse
                    cx="500" cy="1000" rx="400" ry="80"
                    fill="#384414"
                    fillOpacity="0.6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2 }}
                />

                {/* Massive Canopy Base - Bright Sage Green clouds */}
                <motion.path
                    d="M50,450 Q200,50 500,100 T950,450 Q980,650 750,800 T450,850 T50,450"
                    fill="#a7c957"
                    fillOpacity="0.15"
                    filter="url(#foliage-blur)"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 5 }}
                />

                {/* Main Organic Trunk - Growing from ROOT UP */}
                <motion.path
                    d="M500,1000 C500,850 480,750 350,650 C200,550 100,450 100,200"
                    stroke="url(#trunk-gradient)"
                    strokeWidth="100"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 4, ease: "easeOut" }}
                />

                {/* Secondary Branches - High weight, natural curves */}
                <motion.path
                    d="M500,900 C550,750 700,650 850,550 C950,450 920,300 820,150"
                    stroke="url(#trunk-gradient)"
                    strokeWidth="70"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 4, delay: 0.8, ease: "easeOut" }}
                />

                {/* Foliage detail clusters - Vibrancy on dark background */}
                {FOLIAGE_DATA.map((item, i) => (
                    <motion.circle
                        key={i}
                        cx={item.cx}
                        cy={item.cy}
                        r={item.r}
                        fill="#a7c957"
                        fillOpacity="0.2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        transition={{ delay: item.delay, duration: 2 }}
                    />
                ))}

                {/* Flowers - Small pops of Ivory/Yellow */}
                {FLOWER_DATA.map((item, i) => (
                    <motion.g
                        key={`flower-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: item.delay, duration: 1 }}
                    >
                        <circle cx={item.cx} cy={item.cy} r="7" fill="#f2e8cf" fillOpacity="0.9" />
                        <circle cx={item.cx} cy={item.cy} r="3" fill="#e6c875" />
                    </motion.g>
                ))}

                {/* Decorative Birds - More visible teal/blue birds */}
                <motion.path
                    d="M250,350 Q265,335 280,350 Q265,365 250,350"
                    stroke="#118ab2"
                    strokeWidth="3"
                    fill="#118ab2"
                    fillOpacity="0.4"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 6, duration: 3 }}
                />
                <motion.path
                    d="M750,280 Q765,265 780,280 Q765,295 750,280"
                    stroke="#06d6a0"
                    strokeWidth="3"
                    fill="#06d6a0"
                    fillOpacity="0.4"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 6.5, duration: 3 }}
                />
            </svg>
        </div>
    );
}
