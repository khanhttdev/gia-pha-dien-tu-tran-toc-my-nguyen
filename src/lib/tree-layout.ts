import { Edge } from "@xyflow/react";
import { Member, Spouse, MemberMetadata } from "@/lib/types";
import dagre from "dagre";

export interface FamilyNodeData {
    id: string;
    name: string;
    avatarUrl?: string;
    birthYear?: string;
    deathYear?: string;
    role?: string;
    hasChildren?: boolean;
    isSpouse?: boolean;
    generationLevel?: number;
    [key: string]: unknown;
}

export interface FamilyNodeType {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: FamilyNodeData;
}

const NODE_W = 240;
const NODE_H = 100;

export function buildFamilyTree(
    members: Member[] = [],
    spouses: Spouse[] = [],
): { nodes: FamilyNodeType[]; edges: Edge[] } {
    if (members.length === 0) return { nodes: [], edges: [] };

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "BT", ranksep: 180, nodesep: 80 });

    const sorted = [...members].sort((a, b) => {
        if (a.generation_level !== b.generation_level) {
            return (a.generation_level || 0) - (b.generation_level || 0);
        }
        return (a.birth_order || 0) - (b.birth_order || 0);
    });

    const nodes: FamilyNodeType[] = [];
    const edges: Edge[] = [];

    // Member nodes
    sorted.forEach((m) => {
        const hasChildren = sorted.some((c) => c.father_id === m.id || c.mother_id === m.id);
        const meta = (m.metadata as MemberMetadata) || {};

        nodes.push({
            id: m.id,
            type: "family",
            position: { x: 0, y: 0 },
            data: {
                id: m.id,
                name: m.full_name,
                avatarUrl: meta.avatar_url ?? undefined,
                birthYear: meta.birth_year?.toString(),
                deathYear: meta.death_year?.toString(),
                hasChildren,
                role: m.generation_level ? `Đời ${m.generation_level}` : "",
                isSpouse: false,
                generationLevel: m.generation_level || undefined,
            },
        });

        g.setNode(m.id, { width: NODE_W, height: NODE_H });
    });

    // Spouse nodes
    spouses.forEach((s) => {
        const partner = sorted.find((m) => m.id === s.member_id);
        if (!partner) return;

        const spouseId = `spouse-${s.id}`;
        const meta = (s.metadata as MemberMetadata) || {};

        nodes.push({
            id: spouseId,
            type: "family",
            position: { x: 0, y: 0 },
            data: {
                id: s.id,
                name: s.full_name,
                avatarUrl: meta.avatar_url ?? undefined,
                birthYear: meta.birth_year?.toString(),
                deathYear: meta.death_year?.toString(),
                isSpouse: true,
            },
        });

        g.setNode(spouseId, { width: NODE_W, height: NODE_H });

        // Marriage edge
        edges.push({
            id: `marriage-${partner.id}-${spouseId}`,
            source: partner.id,
            target: spouseId,
            type: "family",
            data: { isMarriage: true },
        });
    });

    // Parent-child edges
    sorted.forEach((m) => {
        const parentId = m.father_id || m.mother_id;
        if (parentId && sorted.some((p) => p.id === parentId)) {
            edges.push({
                id: `e-${parentId}-${m.id}`,
                source: parentId,
                target: m.id,
                type: "family",
                data: { isMarriage: false },
            });
            g.setEdge(parentId, m.id);
        }
    });

    // Run dagre layout
    dagre.layout(g);

    // Map coordinates
    const mapped = nodes.map((node) => {
        const d = g.node(node.id);
        if (!d) return node;

        let x = d.x - NODE_W / 2;
        let y = d.y - NODE_H / 2;

        // Fix spouse position (always right of partner)
        if (node.data.isSpouse) {
            const sp = spouses.find((s) => `spouse-${s.id}` === node.id);
            if (sp) {
                const partnerNode = g.node(sp.member_id);
                if (partnerNode) {
                    y = partnerNode.y - NODE_H / 2;
                    x = partnerNode.x + NODE_W / 2 + 20;
                }
            }
        }

        return { ...node, position: { x, y } };
    });

    return { nodes: mapped, edges };
}
