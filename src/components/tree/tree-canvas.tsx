"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    Controls,
    Background,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FamilyNode } from "./family-node";
import { FamilyEdge } from "./family-edge";
import { buildFamilyTree, FamilyNodeType } from "@/lib/tree-layout";
import { Member, Spouse } from "@/lib/types";
import type { Edge } from "@xyflow/react";

const nodeTypes = { family: FamilyNode };
const edgeTypes = { family: FamilyEdge };

interface TreeCanvasProps {
    members: Member[];
    spouses: Spouse[];
    onNodeClick: (member: Member) => void;
}

// Determine max generation from members
function getMaxGeneration(members: Member[]): number {
    return members.reduce((max, m) => Math.max(max, m.generation_level || 0), 0);
}

// Filter nodes/edges to only show up to a given generation
function filterByGeneration(
    allNodes: FamilyNodeType[],
    allEdges: Edge[],
    maxGen: number,
    members: Member[],
    spouses: Spouse[]
): { nodes: FamilyNodeType[]; edges: Edge[] } {
    // Get member IDs that are within generation range
    const visibleMemberIds = new Set(
        members.filter((m) => (m.generation_level || 0) <= maxGen).map((m) => m.id)
    );

    // Include spouses of visible members
    const visibleSpouseIds = new Set(
        spouses.filter((s) => visibleMemberIds.has(s.member_id)).map((s) => `spouse-${s.id}`)
    );

    const visibleIds = new Set([...visibleMemberIds, ...visibleSpouseIds]);

    const nodes = allNodes.filter((n) => visibleIds.has(n.id));
    const edges = allEdges.filter(
        (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );

    return { nodes, edges };
}

// Inner component with access to ReactFlow hooks
function TreeCanvasInner({ members, spouses, onNodeClick }: TreeCanvasProps) {
    const maxGeneration = useMemo(() => getMaxGeneration(members), [members]);
    const [visibleGen, setVisibleGen] = useState(Math.min(2, maxGeneration)); // Start with gen 1-2
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const { fitView } = useReactFlow();

    // Build full tree layout once
    const { allNodes, allEdges } = useMemo(() => {
        const { nodes, edges } = buildFamilyTree(members, spouses);
        return { allNodes: nodes, allEdges: edges };
    }, [members, spouses]);

    // Filter to visible generation
    const { nodes, edges } = useMemo(
        () => filterByGeneration(allNodes, allEdges, visibleGen, members, spouses),
        [allNodes, allEdges, visibleGen, members, spouses]
    );

    // Progressive loading: add one generation every 1.2s
    useEffect(() => {
        if (visibleGen >= maxGeneration) return;

        timerRef.current = setTimeout(() => {
            setVisibleGen((g) => Math.min(g + 1, maxGeneration));
        }, 1200);

        return () => clearTimeout(timerRef.current);
    }, [visibleGen, maxGeneration]);

    // Re-fit view when new generation appears
    useEffect(() => {
        const t = setTimeout(() => fitView({ duration: 600, padding: 0.15 }), 100);
        return () => clearTimeout(t);
    }, [visibleGen, fitView]);

    const handleNodeClick = useCallback(
        (_: unknown, node: { data: { id: string } }) => {
            const member = members.find((m) => m.id === node.data.id);
            if (member) onNodeClick(member);
        },
        [members, onNodeClick]
    );

    return (
        <>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={handleNodeClick}
                fitView
                minZoom={0.1}
                maxZoom={2.5}
                defaultEdgeOptions={{
                    style: { stroke: "rgba(230, 200, 117, 0.2)", strokeWidth: 1.5 },
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#e6c875" gap={50} style={{ opacity: 0.03 }} />
                <Controls
                    position="bottom-right"
                    className="rounded-lg overflow-hidden"
                    style={{
                        background: "rgba(26, 10, 15, 0.9)",
                        border: "1px solid rgba(230, 200, 117, 0.15)",
                    }}
                />
            </ReactFlow>

            {/* Generation loading indicator */}
            {visibleGen < maxGeneration && (
                <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{
                        background: "rgba(26, 10, 15, 0.85)",
                        border: "1px solid rgba(230, 200, 117, 0.2)",
                    }}
                >
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: "#e6c875" }} />
                    <span className="text-xs" style={{ color: "#c8a55a" }}>
                        Đang tải đời {visibleGen + 1}...
                    </span>
                </div>
            )}
        </>
    );
}

export default function TreeCanvas({ members, spouses, onNodeClick }: TreeCanvasProps) {
    return (
        <div
            className="w-full h-full"
            style={{ background: "linear-gradient(180deg, #0f0808 0%, #1a0a0f 50%, #0a0805 100%)" }}
        >
            <ReactFlowProvider>
                <TreeCanvasInner members={members} spouses={spouses} onNodeClick={onNodeClick} />
            </ReactFlowProvider>

            {/* ReactFlow transparent bg override */}
            <style>{`
        .react-flow, .react-flow__bg {
          background: transparent !important;
          background-color: transparent !important;
        }
        .react-flow__controls button {
          background: transparent !important;
          border: none !important;
          color: #e6c875 !important;
          fill: #e6c875 !important;
        }
        .react-flow__controls button:hover {
          background: rgba(230, 200, 117, 0.1) !important;
        }
        .react-flow__controls button svg {
          fill: #e6c875 !important;
        }
      `}</style>
        </div>
    );
}
