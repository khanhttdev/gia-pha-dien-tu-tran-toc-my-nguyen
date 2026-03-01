import { Edge } from "@xyflow/react";
import { Member, Spouse, MemberMetadata } from "@/lib/types";
import { PersonNodeType } from "@/components/tree/person-node";
import dagre from "dagre";

const nodeWidth = 280;
const nodeHeight = 120;

export function buildTreeLayout(
  members: Member[],
  spouses: Spouse[] = [],
): { nodes: PersonNodeType[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Ranksep increased to give more space for marriage lines
  dagreGraph.setGraph({ rankdir: "TB", ranksep: 100, nodesep: 100 });

  const nodes: PersonNodeType[] = [];
  const edges: Edge[] = [];

  // 1. Tạo Node cho Member (Huyết thống)
  members.forEach((m) => {
    const hasChildren = members.some((child) => child.father_id === m.id || child.mother_id === m.id);
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

  // 2. Tạo Node cho Spouse (Phu/Thê) và Edge Hôn nhân
  spouses.forEach((s) => {
    // Chỉ render spouse nếu Member tương ứng có trong danh sách
    const partner = members.find(m => m.id === s.member_id);
    if (!partner) return;

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

    // Trong Dagre, ta đặt Spouse nằm cạnh Member bằng cách tạo edge giả với trọng số cao
    dagreGraph.setNode(spouseId, { width: nodeWidth, height: nodeHeight });

    // Edge hôn nhân hiển thị
    edges.push({
      id: `marriage-${partner.id}-${spouseId}`,
      source: partner.id,
      target: spouseId,
      sourceHandle: "marriage-right",
      targetHandle: "marriage-left",
      type: "marriage", // Custom edge type
    });

    // Quan hệ trong Dagre để chúng cùng rank (cùng tầng)
    // Lưu ý: Dagre graphlib không hỗ trợ cùng rank dễ dàng, nhưng ta có thể ép nó bằng rankdir và nodesep
    // Một mẹo nhỏ là coi Spouse như con của Member nhưng với rank 'same' (nếu dùng D3) 
    // Ở đây ta cứ để Dagre tự tính, sau đó sẽ fix tọa độ Y
  });

  // 3. Xây dựng Edge huyết mạch (Parent -> Child)
  members.forEach((m) => {
    const parentId = m.father_id || m.mother_id;
    if (parentId) {
      edges.push({
        id: `e-${parentId}-${m.id}`,
        source: parentId,
        target: m.id,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "var(--color-heritage-gold)",
          strokeWidth: 2,
          filter: "drop-shadow(0 0 3px rgba(230,200,117,0.4))"
        },
      });
      dagreGraph.setEdge(parentId, m.id);
    }
  });

  // Chạy thuật toán Dagre
  dagre.layout(dagreGraph);

  // 4. Map lại tọa độ và Fix Spouse Position
  const mappedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    if (!dagreNode) return node;

    let x = dagreNode.x - nodeWidth / 2;
    let y = dagreNode.y - nodeHeight / 2;

    // Nếu là Spouse, ta cố gắng đẩy nó sang phải Member
    if (node.data.isSpouse) {
      // Tìm partner của spouse này
      const spouseObj = spouses.find(s => `spouse-${s.id}` === node.id);
      if (spouseObj) {
        const partnerDagre = dagreGraph.node(spouseObj.member_id);
        if (partnerDagre) {
          // Ép Y bằng nhau và X cách nhau một khoảng nodeWidth + gap
          y = partnerDagre.y - nodeHeight / 2;
          x = partnerDagre.x + nodeWidth / 2 + 40;
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
