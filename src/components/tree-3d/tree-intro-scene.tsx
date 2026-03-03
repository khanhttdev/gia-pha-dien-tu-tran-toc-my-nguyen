"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import GrowingTree from "./growing-tree";
import TreeEnvironment from "./tree-environment";

interface TreeIntroSceneProps {
    onComplete: () => void;
    memberCount?: number;
}

const ANIMATION_DURATION = 8000; // 8 seconds total

export default function TreeIntroScene({ onComplete, memberCount = 0 }: TreeIntroSceneProps) {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    const startTimeRef = useRef<number>(0);
    const rafRef = useRef<number>(0);

    const handleSkip = useCallback(() => {
        setFadeOut(true);
        cancelAnimationFrame(rafRef.current);
        setTimeout(onComplete, 600);
    }, [onComplete]);

    useEffect(() => {
        startTimeRef.current = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTimeRef.current;
            const p = Math.min(1, elapsed / ANIMATION_DURATION);

            // Ease-in-out cubic for natural feel
            const eased = p < 0.5
                ? 4 * p * p * p
                : 1 - Math.pow(-2 * p + 2, 3) / 2;

            setProgress(eased);

            if (p < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                // Animation finished, start fade out
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(onComplete, 600);
                }, 500);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [onComplete]);

    // Stage labels based on progress
    const getStageText = () => {
        if (progress < 0.15) return "Hạt giống được gieo…";
        if (progress < 0.35) return "Mầm non nảy nở…";
        if (progress < 0.55) return "Rễ sâu bám vững…";
        if (progress < 0.75) return "Cành lá vươn xa…";
        if (progress < 0.9) return "Tán cây xum xuê…";
        return "Dòng tộc hưng thịnh!";
    };

    return (
        <div
            className={`fixed inset-0 z-50 transition-opacity duration-600 ${fadeOut ? "opacity-0" : "opacity-100"}`}
            style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #1a0a0a 50%, #0a0a05 100%)" }}
        >
            {/* Three.js Canvas */}
            <Canvas
                camera={{ position: [0, 1, 4], fov: 50 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: false }}
                style={{ width: "100%", height: "100%" }}
            >
                <color attach="background" args={["#0a0a1a"]} />
                <fog attach="fog" args={["#0a0a1a", 5, 12]} />
                <TreeEnvironment progress={progress} />
                <GrowingTree progress={progress} />
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-12">
                {/* Top: Title */}
                <div className="text-center">
                    <h1
                        className="text-3xl md:text-5xl font-serif tracking-wide"
                        style={{
                            color: "#e6c875",
                            opacity: 0.3 + progress * 0.7,
                            textShadow: "0 2px 20px rgba(230, 200, 117, 0.3)",
                        }}
                    >
                        Trần Tộc Mỹ Nguyên
                    </h1>
                    <p
                        className="mt-3 text-sm md:text-base tracking-widest uppercase"
                        style={{
                            color: "#c8a85c",
                            opacity: Math.max(0, progress - 0.1),
                            letterSpacing: "0.2em",
                        }}
                    >
                        Gia Phả Điện Tử
                    </p>
                </div>

                {/* Center: Stage text */}
                <div
                    className="text-center transition-all duration-500"
                    style={{ opacity: 0.5 + progress * 0.5 }}
                >
                    <p
                        className="font-serif text-lg md:text-xl italic"
                        style={{
                            color: "#d4b86a",
                            textShadow: "0 0 30px rgba(230, 200, 117, 0.2)",
                        }}
                    >
                        {getStageText()}
                    </p>
                    {memberCount > 0 && progress > 0.6 && (
                        <p
                            className="mt-2 text-xs"
                            style={{
                                color: "#997835",
                                opacity: (progress - 0.6) * 2.5,
                            }}
                        >
                            {memberCount} thành viên trong dòng tộc
                        </p>
                    )}
                </div>

                {/* Bottom: Skip button + progress */}
                <div className="flex flex-col items-center gap-4 pointer-events-auto">
                    {/* Progress bar */}
                    <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-100"
                            style={{
                                width: `${progress * 100}%`,
                                background: "linear-gradient(90deg, #997835, #e6c875)",
                            }}
                        />
                    </div>

                    {/* Skip button */}
                    <button
                        onClick={handleSkip}
                        className="text-xs uppercase tracking-widest px-6 py-2 rounded-full border transition-all duration-300 hover:bg-white/10 cursor-pointer"
                        style={{
                            color: "#997835",
                            borderColor: "rgba(153, 120, 53, 0.3)",
                        }}
                        aria-label="Bỏ qua animation và xem cây gia phả"
                    >
                        Bỏ qua →
                    </button>
                </div>
            </div>
        </div>
    );
}
