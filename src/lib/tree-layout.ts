import { Edge } from "@xyflow/react";
import { Member, Spouse, MemberMetadata } from "@/lib/types";
import { PersonNodeType } from "@/components/tree/person-node";
import dagre from "dagre";

const nodeWidth = 200; // Adjusted for circular fruit nodes
const nodeHeight = 200;

export function buildTreeLayout(
  members: Member[] = [],
  spouses: Spouse[] = [],
): { nodes: PersonNodeType[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Sort members by generation and birth order to help dagre layout
  const sortedMembers = [...members].sort((a, b) => {
    if (a.generation_level !== b.generation_level) {
      return (a.generation_level || 0) - (b.generation_level || 0);
    }
    return (a.birth_order || 0) - (b.birth_order || 0);
  });

  // Ranksep Bottom-to-Top (BT)
  dagreGraph.setGraph({ rankdir: "BT", ranksep: 120, nodesep: 80 });

  const nodes: PersonNodeType[] = [];
  const edges: Edge[] = [];

  // 1. Create Member Nodes
  sortedMembers.forEach((m) => {
    const hasChildren = sortedMembers.some((child) => child.father_id === m.id || child.mother_id === m.id);
    const meta = (m.metadata as MemberMetadata) || {};

    nodes.push({
      id: m.id,
      type: "person",
      position: { x: 0, y: 0 },
      data: {
        id: m.id,
        name: m.full_name,
        avatarUrl: meta.avatar_url,
        birthYear: meta.birth_year,
        deathYear: meta.death_year,
        hasChildren,
        role: m.generation_level ? `Đời thứ ${m.generation_level}` : "Thành viên",
        isSpouse: false,
      },
    });

    dagreGraph.setNode(m.id, { width: nodeWidth, height: nodeHeight });
  });

  // 2. Create Spouse Nodes and attach to members
  spouses.forEach((s) => {
    const partner = sortedMembers.find(m => m.id === s.member_id);
    if (!partner) return;

    // Attach to member node data for easy access/testing
    const partnerNode = nodes.find(n => n.id === partner.id);
    if (partnerNode) {
      if (!partnerNode.data.spouses) (partnerNode.data as any).spouses = [];
      (partnerNode.data as any).spouses.push(s);
    }

    const spouseId = `spouse-${s.id}`;
    const sMeta = (s.metadata as MemberMetadata) || {};

    nodes.push({
      id: spouseId,
      type: "person",
      position: { x: 0, y: 0 },
      data: {
        id: s.id,
        name: s.full_name,
        avatarUrl: sMeta.avatar_url,
        birthYear: sMeta.birth_year,
        deathYear: sMeta.death_year,
        isSpouse: true,
      },
    });

    dagreGraph.setNode(spouseId, { width: nodeWidth, height: nodeHeight });

    // Marriage Edge
    edges.push({
      id: `marriage-${partner.id}-${spouseId}`,
      source: partner.id,
      target: spouseId,
      sourceHandle: "marriage-right",
      targetHandle: "marriage-left",
      type: "marriage",
    });
  });

  // 3. Bloodline Edges (Parent -> Child)
  sortedMembers.forEach((m) => {
    const parentId = m.father_id || m.mother_id;
    const parentExists = sortedMembers.some(p => p.id === parentId);

    if (parentId && parentExists) {
      edges.push({
        id: `e-${parentId}-${m.id}`,
        source: parentId,
        target: m.id,
        type: "step",
        animated: false,
        style: {
          stroke: "var(--color-heritage-gold-dim)",
          strokeWidth: 2,
          opacity: 0.4
        },
      });
      dagreGraph.setEdge(parentId, m.id);
    }
  });

  // Run Dagre layout
  dagre.layout(dagreGraph);

  // 4. Map Coordinates & Fix Spouse Position
  const mappedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    if (!dagreNode) return node;

    let x = dagreNode.x - nodeWidth / 2;
    let y = dagreNode.y - nodeHeight / 2;

    // Organic offset: Shift X slightly based on Y to avoid perfect grids
    const organicShift = Math.sin(y * 0.01) * 30;
    x += organicShift;

    // Fix Spouse Position (Always to the right of partner)
    if (node.data.isSpouse) {
      const spouseObj = spouses.find(s => `spouse-${s.id}` === node.id);
      if (spouseObj) {
        const partnerDagre = dagreGraph.node(spouseObj.member_id);
        if (partnerDagre) {
          y = (partnerDagre.y - nodeHeight / 2);
          x = (partnerDagre.x + nodeWidth / 2 + 30) + (Math.sin(partnerDagre.y * 0.01) * 30);
        }
      }
    }

    return {
      ...node,
      position: { x, y },
    };
  });

  return { nodes: mappedNodes, edges };
}
