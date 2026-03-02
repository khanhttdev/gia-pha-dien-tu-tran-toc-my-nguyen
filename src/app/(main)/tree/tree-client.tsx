"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import TreeCanvas from "@/components/tree/tree-canvas";
import { MemberModal } from "@/components/tree/member-modal";
import { Member, Spouse } from "@/lib/types";

// Lazy load Three.js intro scene — keeps initial bundle small
const TreeIntroScene = dynamic(
    () => import("@/components/tree-3d/tree-intro-scene"),
    { ssr: false }
);

const INTRO_SEEN_KEY = "tree_intro_seen";

interface TreeClientProps {
    initialMembers: Member[];
    initialSpouses: Spouse[];
    defaultRootId: string | null;
}

export default function TreeClient({
    initialMembers,
    initialSpouses,
}: TreeClientProps) {
    const [showIntro, setShowIntro] = useState<boolean | null>(null);
    const [treeReady, setTreeReady] = useState(false); // Defer tree mount
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        const seen = localStorage.getItem(INTRO_SEEN_KEY);
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const shouldShowIntro = !seen && !prefersReduced;
        setShowIntro(shouldShowIntro);

        // If skipping intro, mount tree immediately
        if (!shouldShowIntro) {
            setTreeReady(true);
        }
    }, []);

    const handleIntroComplete = useCallback(() => {
        localStorage.setItem(INTRO_SEEN_KEY, "true");
        setShowIntro(false);
        // Small delay before mounting the heavy ReactFlow tree
        setTimeout(() => setTreeReady(true), 100);
    }, []);

    const handleNodeClick = useCallback((member: Member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    }, []);

    // Loading state while checking localStorage
    if (showIntro === null) {
        return (
            <div
                className="w-screen h-screen flex items-center justify-center"
                style={{ background: "#0a0a1a" }}
            >
                <div className="animate-pulse text-center">
                    <p className="font-serif text-lg" style={{ color: "#997835" }}>
                        Đang tải...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            {/* Three.js Intro Animation */}
            {showIntro && (
                <TreeIntroScene
                    onComplete={handleIntroComplete}
                    memberCount={initialMembers.length}
                />
            )}

            {/* ReactFlow Tree — only mounts AFTER intro completes */}
            <div
                className={`absolute inset-0 transition-opacity duration-500 ${showIntro || !treeReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
                {treeReady && (
                    <TreeCanvas
                        members={initialMembers}
                        spouses={initialSpouses}
                        onNodeClick={handleNodeClick}
                    />
                )}
            </div>

            {/* Member Detail Modal */}
            <MemberModal
                member={selectedMember}
                spouses={initialSpouses}
                isOpen={isModalOpen}
                onClose={setIsModalOpen}
            />
        </div>
    );
}
