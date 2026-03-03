"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import TreeCanvas from "@/components/tree/tree-canvas";
import { MemberModal } from "@/components/tree/member-modal";
import { Member, Spouse } from "@/lib/types";
import { useTreeStore } from "@/lib/stores";

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
    // ─── Tree Store ──────────────────────────────────────────────────────────────
    const members = useTreeStore((s) => s.members);
    const spouses = useTreeStore((s) => s.spouses);
    const selectedMember = useTreeStore((s) => s.selectedMember);
    const isModalOpen = useTreeStore((s) => s.isModalOpen);
    const treeStatus = useTreeStore((s) => s.status);
    const hydrateTree = useTreeStore((s) => s.hydrateTree);
    const selectMember = useTreeStore((s) => s.selectMember);
    const closeModal = useTreeStore((s) => s.closeModal);

    // ─── Local intro state (UI-only, not in store) ──────────────────────────────
    const [showIntro, setShowIntro] = useState<boolean | null>(null);
    const [treeReady, setTreeReady] = useState(false);

    // Hydrate store with SSR data
    useEffect(() => {
        if (treeStatus === "idle") {
            hydrateTree(initialMembers, initialSpouses);
        }
    }, [treeStatus, hydrateTree, initialMembers, initialSpouses]);

    // Check localStorage on mount
    useEffect(() => {
        const seen = localStorage.getItem(INTRO_SEEN_KEY);
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const shouldShowIntro = !seen && !prefersReduced;
        setShowIntro(shouldShowIntro);

        if (!shouldShowIntro) {
            setTreeReady(true);
        }
    }, []);

    const handleIntroComplete = useCallback(() => {
        localStorage.setItem(INTRO_SEEN_KEY, "true");
        setShowIntro(false);
        setTimeout(() => setTreeReady(true), 100);
    }, []);

    const handleNodeClick = useCallback((member: Member) => {
        selectMember(member);
    }, [selectMember]);

    const handleModalClose = useCallback((_open: boolean) => {
        if (!_open) closeModal();
    }, [closeModal]);

    // Use store data (hydrated from SSR) or fallback to initial
    const activeMembers = members.length > 0 ? members : initialMembers;
    const activeSpouses = spouses.length > 0 ? spouses : initialSpouses;

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
                    memberCount={activeMembers.length}
                />
            )}

            {/* ReactFlow Tree — only mounts AFTER intro completes */}
            <div
                className={`absolute inset-0 transition-opacity duration-500 ${showIntro || !treeReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
                {treeReady && (
                    <TreeCanvas
                        members={activeMembers}
                        spouses={activeSpouses}
                        onNodeClick={handleNodeClick}
                    />
                )}
            </div>

            {/* Member Detail Modal — driven by TreeStore */}
            <MemberModal
                member={selectedMember}
                spouses={activeSpouses}
                isOpen={isModalOpen}
                onClose={handleModalClose}
            />
        </div>
    );
}
