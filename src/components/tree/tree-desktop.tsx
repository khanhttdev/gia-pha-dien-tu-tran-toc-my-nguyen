"use client";
import { useMemo, useState, useCallback, useRef } from "react";
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
}: {
    members: Member[];
    spouses: Spouse[];
    selectedMember: Member | null;
    setSelectedMember: (m: Member | null) => void;
    nodes: any[];
    edges: any[];
    onNodesChange: any;
    onEdgesChange: any;
}) {
    const { setCenter } = useReactFlow();

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: any) => {
            if (node.id.startsWith("spouse-")) {
                const sId = node.id.replace("spouse-", "");
                const spouse = spouses.find((s) => s.id === sId);
                if (spouse) {
                    // Chuyển đổi Spouse thành Member-like để ProfileModal hiển thị
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
            <TreeSidebar
                members={members}
                onSelectMember={(m) => {
                    setSelectedMember(m);
                    // Focus to node
                    const node = nodes.find(n => n.id === m.id);
                    if (node) {
                        setCenter(node.position.x + 120, node.position.y + 70, { zoom: 1, duration: 800 });
                    }
                }}
            />

            {/* Main Canvas Area */}
            <div className="absolute inset-0 left-80 text-[var(--color-heritage-gold)]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                    onlyRenderVisibleElements={true}
                >
                    <Background gap={16} size={1} color="var(--color-heritage-gold-dim)" />
                </ReactFlow>
            </div>
        </div>
    );
}

export function TreeDesktop({
    members,
    spouses,
    defaultRootId
}: {
    members: Member[],
    spouses: Spouse[],
    defaultRootId?: string | null
}) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        return buildTreeLayout(members, spouses);
    }, [members, spouses]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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
