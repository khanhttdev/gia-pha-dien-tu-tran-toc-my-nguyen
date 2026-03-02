"use client";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Member, Spouse } from "@/lib/types";
import { PersonNode } from "@/components/tree/person-node";
import { buildTreeLayout } from "@/lib/tree-layout";
import { MemberProfileModal } from "@/components/tree/member-profile-modal";
import { TreeSidebar } from "@/components/tree/tree-sidebar";
import { MarriageEdge } from "@/components/tree/marriage-edge";
import { TreeBackground } from "@/components/tree/tree-background";
import { TreeBanner } from "@/components/tree/tree-banner";
import { TreeDecorations, GenerationLabel } from "@/components/tree/tree-decorations";

const nodeTypes = {
    person: PersonNode,
};

const edgeTypes = {
    marriage: MarriageEdge,
};

function FlowCanvas({
    members,
    spouses,
    selectedMember,
    setSelectedMember,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    isMobile,
    onLoadMore,
    canLoadMore,
    visibleGenerations,
}: {
    members: Member[];
    spouses: Spouse[];
    selectedMember: Member | null;
    setSelectedMember: (m: Member | null) => void;
    nodes: any[];
    edges: any[];
    onNodesChange: any;
    onEdgesChange: any;
    isMobile?: boolean;
    onLoadMore: () => void;
    canLoadMore: boolean;
    visibleGenerations: number;
}) {
    const { setCenter } = useReactFlow();

    // Scroll detection for lazy loading descendants
    const onMove = useCallback((_: any, viewport: { x: number, y: number, zoom: number }) => {
        // Trigger loadMore if user is looking at the top area (descendants)
        // In BT mode, descendants are at small Y values.
        if (canLoadMore && viewport.y > 100) { // arbitrary threshold for "scrolling up"
            onLoadMore();
        }
    }, [onLoadMore, canLoadMore]);

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: any) => {
            if (node.id.startsWith("spouse-")) {
                const sId = node.id.replace("spouse-", "");
                const spouse = spouses.find((s) => s.id === sId);
                if (spouse) {
                    const virtualMember = {
                        ...spouse,
                        father_id: null,
                        mother_id: null,
                        generation_level: null,
                    } as unknown as Member;
                    setSelectedMember(virtualMember);
                }
            } else {
                const member = members.find((m) => m.id === node.id) || null;
                setSelectedMember(member);
            }
        },
        [members, spouses, setSelectedMember]
    );

    return (
        <div className="w-full h-full relative">
            {!isMobile && (
                <TreeSidebar
                    members={members}
                    onSelectMember={(m) => {
                        setSelectedMember(m);
                        const node = nodes.find(n => n.id === m.id);
                        if (node) {
                            setCenter(node.position.x + 120, node.position.y + 70, { zoom: 1, duration: 800 });
                        }
                    }}
                />
            )}

            {/* Main Canvas Area */}
            <div className={`absolute inset-0 text-[var(--color-heritage-gold)] ${!isMobile ? 'left-80' : 'left-0'} bg-parchment ornate-frame overflow-hidden`}>
                <TreeBanner />
                <TreeDecorations />
                <TreeBackground />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onMove={onMove}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                    onlyRenderVisibleElements={true}
                >
                    {/* Generation Labels (Artistic) */}
                    {[...Array(visibleGenerations)].map((_, i) => (
                        <GenerationLabel
                            key={`gen-label-${i + 1}`}
                            text={`THẾ HỆ ${i + 1}`}
                            y={1000 - ((i + 1) * 200) + 100} // Matches layout logic offsets roughly
                        />
                    ))}

                    <Background gap={16} size={1} color="var(--color-heritage-gold-dim)" />
                    <Controls showInteractive={false} className="bg-black/40 border-[var(--color-heritage-gold-dim)]/30" />
                </ReactFlow>
            </div>
        </div>
    );
}

export function TreeDesktop({
    members,
    spouses,
    defaultRootId,
    isMobile,
}: {
    members: Member[],
    spouses: Spouse[],
    defaultRootId?: string | null,
    isMobile?: boolean,
}) {
    const [visibleGenerations, setVisibleGenerations] = useState(2); // Start with 2 generations

    const filteredMembers = useMemo(() => {
        return members.filter(m => (m.generation_level || 1) <= visibleGenerations);
    }, [members, visibleGenerations]);

    const filteredSpouses = useMemo(() => {
        return spouses.filter(s => {
            const partner = members.find(m => m.id === s.member_id);
            return partner && (partner.generation_level || 1) <= visibleGenerations;
        });
    }, [spouses, members, visibleGenerations]);

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        return buildTreeLayout(filteredMembers, filteredSpouses);
    }, [filteredMembers, filteredSpouses]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Dynamic update when visibleGenerations changes
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    // Expose a way to load more
    const loadMore = useCallback(() => {
        setVisibleGenerations(prev => prev + 1);
    }, []);

    return (
        <div className="w-full h-full relative">
            <ReactFlowProvider>
                <FlowCanvas
                    members={members}
                    spouses={spouses}
                    selectedMember={selectedMember}
                    setSelectedMember={setSelectedMember}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onLoadMore={loadMore}
                    canLoadMore={visibleGenerations < 10} // Limit to 10 generations for now
                    visibleGenerations={visibleGenerations}
                    isMobile={isMobile}
                />
            </ReactFlowProvider>

            <MemberProfileModal
                member={selectedMember}
                spouses={spouses}
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
            />
        </div>
    );
}
