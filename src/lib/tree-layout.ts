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

const NODE_W = 130;
const NODE_H = 120;

/**
 * Get all descendants of a given root member (including root).
 * This allows us to show a compact subtree instead of the entire 400+ node tree.
 */
function getDescendants(rootId: string, members: Member[]): Set<string> {
    const descendants = new Set<string>();
    const queue = [rootId];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (descendants.has(current)) continue;
        descendants.add(current);

        // Find children: members whose father_id or mother_id (via spouse) is current
        for (const m of members) {
            if (m.father_id === current && !descendants.has(m.id)) {
                queue.push(m.id);
            }
        }
    }

    return descendants;
}

/**
 * Find the root ancestor (Gen 1) or the member with no father.
 */
export function findRootMember(members: Member[]): string | null {
    // Prefer Gen 1 member with no father
    const gen1 = members
        .filter((m) => (m.generation_level || 99) === 1)
        .sort((a, b) => (a.birth_order || 0) - (b.birth_order || 0));

    if (gen1.length > 0) return gen1[0].id;

    // Fallback: member with no father_id
    const roots = members.filter((m) => !m.father_id);
    return roots.length > 0 ? roots[0].id : members[0]?.id || null;
}

export function buildFamilyTree(
    members: Member[] = [],
    spouses: Spouse[] = [],
    rootId?: string | null,
): { nodes: FamilyNodeType[]; edges: Edge[] } {
    if (members.length === 0) return { nodes: [], edges: [] };

    // If rootId is provided, only show descendants of that root
    let visibleMembers = members;
    if (rootId) {
        const descendantIds = getDescendants(rootId, members);
        visibleMembers = members.filter((m) => descendantIds.has(m.id));
    }

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "BT", ranksep: 200, nodesep: 40 });

    const sorted = [...visibleMembers].sort((a, b) => {
        if (a.generation_level !== b.generation_level) {
            return (a.generation_level || 0) - (b.generation_level || 0);
        }
        return (a.birth_order || 0) - (b.birth_order || 0);
    });

    const visibleIds = new Set(sorted.map((m) => m.id));
    const nodes: FamilyNodeType[] = [];
    const edges: Edge[] = [];

    // Member nodes
    sorted.forEach((m) => {
        const hasChildren = sorted.some((c) => c.father_id === m.id);
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

    // Spouse nodes (only for visible members)
    const visibleSpouses = spouses.filter((s) => visibleIds.has(s.member_id));
    visibleSpouses.forEach((s) => {
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

    // Parent-child edges (only within visible set)
    sorted.forEach((m) => {
        if (m.father_id && visibleIds.has(m.father_id)) {
            edges.push({
                id: `e-${m.father_id}-${m.id}`,
                source: m.father_id,
                target: m.id,
                type: "family",
                data: { isMarriage: false },
            });
            g.setEdge(m.father_id, m.id);
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
            const sp = visibleSpouses.find((s) => `spouse-${s.id}` === node.id);
            if (sp) {
                const partnerNode = g.node(sp.member_id);
                if (partnerNode) {
                    y = partnerNode.y - NODE_H / 2;
                    x = partnerNode.x + NODE_W / 2 + 10;
                }
            }
        }

        return { ...node, position: { x, y } };
    });

    return { nodes: mapped, edges };
}
