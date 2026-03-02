"use client";

import { motion } from "framer-motion";

export function TreeBanner() {
    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, type: "spring" }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
            <div className="relative">
                {/* Scroll Background */}
                <svg width="600" height="100" viewBox="0 0 600 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 20H550L580 50L550 80H50L20 50L50 20Z" fill="var(--color-heritage-banner)" fillOpacity="0.9" stroke="var(--color-heritage-gold)" strokeWidth="2" />
                    <path d="M50 20L70 40M550 20L530 40M50 80L70 60M550 80L530 60" stroke="var(--color-heritage-gold)" strokeWidth="2" />
                    <circle cx="20" cy="50" r="8" fill="var(--color-heritage-gold-dim)" stroke="var(--color-heritage-gold)" strokeWidth="2" />
                    <circle cx="580" cy="50" r="8" fill="var(--color-heritage-gold-dim)" stroke="var(--color-heritage-gold)" strokeWidth="2" />
                </svg>

                {/* Banner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <h1 className="text-3xl font-bold tracking-widest text-center uppercase" style={{ color: 'var(--color-heritage-banner-text)', fontFamily: 'serif' }}>
                        Sơ Đồ Gia Phả Thủy Tổ
                    </h1>
                    <p className="text-xs italic opacity-80" style={{ color: 'var(--color-heritage-banner-text)' }}>
                        (GIA ĐÌNH HỌ TRẦN - VIỆT NAM)
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
