import { motion } from "framer-motion";

export function TreeDecorations() {
    return (
        <div className="fixed inset-0 z-40 pointer-events-none select-none">
            {/* Ornate corners */}
            <Corner decoration="top-left" />
            <Corner decoration="top-right" />
            <Corner decoration="bottom-left" />
            <Corner decoration="bottom-right" />

            {/* Frame border */}
            <div className="absolute inset-4 md:inset-8 border-[1px] border-[var(--color-heritage-gold)]/20 rounded-[2rem] pointer-events-none" />
            <div className="absolute inset-5 md:inset-10 border-[1px] border-[var(--color-heritage-gold)]/10 rounded-[1.8rem] pointer-events-none" />
        </div>
    );
}

function Corner({ decoration }: { decoration: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
    const positions = {
        "top-left": "top-0 left-0",
        "top-right": "top-0 right-0 rotate-90",
        "bottom-left": "bottom-0 left-0 -rotate-90",
        "bottom-right": "bottom-0 right-0 rotate-180"
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className={`absolute w-32 h-32 md:w-48 md:h-48 ${positions[decoration]} opacity-60 p-4 md:p-8`}
        >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[var(--color-heritage-gold)]">
                <path d="M0 0H20C20 0 10 0 5 10C0 20 0 40 0 40V20V0Z" fill="currentColor" />
                <path d="M10 10V25M25 10H10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
        </motion.div>
    );
}
