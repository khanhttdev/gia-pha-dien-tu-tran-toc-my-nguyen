import { hierarchy, HierarchyNode } from "d3-hierarchy";
import { Member, MemberMetadata, Spouse } from "./types";

export type TreeMember = Member & {
  children?: TreeMember[];
  spouses?: Spouse[];
  _isExpanded?: boolean;
};

/**
 * Build a d3-compatible tree hierarchy from a flat array of members.
 * Finds the root (no father_id) and recursively nests children.
 * Attaches spouses to their respective member node.
 */
export function buildTreeHierarchy(
  members: Member[],
  spouses: Spouse[] = [],
  rootId?: string | null,
): HierarchyNode<TreeMember> | null {
  if (!members.length) return null;

  const memberMap = new Map<string, TreeMember>();

  // Group spouses by member_id
  const spousesByMember = new Map<string, Spouse[]>();
  for (const sp of spouses) {
    if (!spousesByMember.has(sp.member_id)) {
      spousesByMember.set(sp.member_id, []);
    }
    spousesByMember.get(sp.member_id)!.push(sp);
  }

  for (const m of members) {
    memberMap.set(m.id, {
      ...m,
      children: [],
      spouses: spousesByMember.get(m.id) || []
    });
  }

  let root: TreeMember | null = null;

  // If a custom rootId is specified, use it
  if (rootId && memberMap.has(rootId)) {
    root = memberMap.get(rootId)!;
  }

  for (const member of memberMap.values()) {
    if (member.father_id && memberMap.has(member.father_id)) {
      const parent = memberMap.get(member.father_id)!;
      parent.children!.push(member);
    } else if (!member.father_id) {
      // Root member: no father (only used if rootId not set)
      if (!root || (!rootId && member.generation_level < root.generation_level)) {
        if (!rootId) root = member;
      }
    }
  }

  if (!root) {
    // Fallback: pick the member with the lowest generation_level
    root = [...memberMap.values()].sort(
      (a, b) => a.generation_level - b.generation_level,
    )[0];
  }

  // Sort children by birth_order
  const sortChildren = (node: TreeMember) => {
    if (node.children?.length) {
      node.children.sort((a, b) => (a.birth_order ?? 0) - (b.birth_order ?? 0));
      node.children.forEach(sortChildren);
    }
  };
  sortChildren(root);

  // Remove empty children arrays (leaf nodes)
  const cleanEmpty = (node: TreeMember) => {
    if (node.children?.length === 0) {
      delete node.children;
    } else {
      node.children?.forEach(cleanEmpty);
    }
  };
  cleanEmpty(root);

  return hierarchy(root, (d) => d.children);
}

/**
 * Extract metadata helper
 */
export function getMeta(member: Member): MemberMetadata {
  return (member.metadata as MemberMetadata) ?? {};
}

/**
 * Format lifespan string: "1920 - 2005" or "1920 - nay"
 */
export function formatLifespan(member: Member): string {
  const meta = getMeta(member);
  if (!meta.birth_year) return "";
  const death = meta.is_alive === false && meta.death_year
    ? meta.death_year
    : meta.is_alive === false
      ? "?"
      : "nay";
  return `${meta.birth_year} — ${death}`;
}

/**
 * Generation label
 */
export function getGenerationLabel(level: number): string {
  return `Đời ${level}`;
}

/**
 * Get initials from full_name for avatar fallback
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
