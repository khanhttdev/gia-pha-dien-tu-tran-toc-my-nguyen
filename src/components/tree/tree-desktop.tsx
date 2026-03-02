import React, { useMemo } from "react";
import { ReactFlow, ReactFlowProvider, ControlButton, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TreeBackground } from "./tree-background";
import { PersonNode } from "./person-node";
import { MarriageEdge } from "./marriage-edge";
import { buildTreeLayout } from "@/lib/tree-layout";
import { Member, Spouse } from "@/lib/types";
import { TreeDecorations } from "./tree-decorations";

const nodeTypes = {
    person: PersonNode,
};

const edgeTypes = {
    marriage: MarriageEdge,
};

interface TreeDesktopProps {
    members: Member[];
    spouses: Spouse[];
    onNodeClick: (member: Member) => void;
}

export default function TreeDesktop({ members, spouses, onNodeClick }: TreeDesktopProps) {
    const { nodes, edges } = useMemo(() => buildTreeLayout(members, spouses), [members, spouses]);

    const handleNodeClick = (_: any, node: any) => {
        const member = members.find(m => m.id === node.data.id);
        if (member) onNodeClick(member);
    };

    return (
        <div className="w-full h-full relative overflow-hidden">
            <TreeBackground />
            <TreeDecorations />

            <div className="w-full h-full relative z-10">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodeClick={handleNodeClick}
                        fitView
                        minZoom={0.2}
                        maxZoom={2}
                        defaultEdgeOptions={{
                            style: { stroke: 'var(--color-heritage-gold-dim)', strokeWidth: 2 },
                        }}
                    >
                        <Background color="#e6c875" gap={40} style={{ opacity: 0.05 }} />
                        <Controls
                            position="bottom-right"
                            className="bg-[#2a0a0f] border border-[var(--color-heritage-gold)]/30 rounded-lg overflow-hidden [&_button]:bg-transparent [&_button]:border-none [&_button]:text-[var(--color-heritage-gold)]"
                        />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
}

export { TreeDesktop };
