"use client";

import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { tree as d3Tree, HierarchyPointNode } from "d3-hierarchy";
import {
    TransformWrapper,
    TransformComponent,
    ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { TreeMemberNode, NODE_WIDTH, NODE_HEIGHT } from "./TreeMemberNode";
import { TreeToolbar } from "./TreeToolbar";
import { TreeHeader } from "./TreeHeader";
import { RootSelector } from "./RootSelector";
import { MemberDetailModal } from "./MemberDetailModal";
import { TreeSearch } from "./TreeSearch";
import { TreeMember, buildTreeHierarchy } from "@/lib/tree-utils";
import { Member, Spouse } from "@/lib/types";

// ─── Layout constants ─────────────────────────────────────────────────────────
const H_SPACING = NODE_WIDTH + 20;
const V_SPACING = NODE_HEIGHT + 80;
const PADDING = 100;

type FamilyTreeCanvasProps = {
    members: Member[];
    spouses: Spouse[];
};

export function FamilyTreeCanvas({ members, spouses }: FamilyTreeCanvasProps) {
    const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [selectedMember, setSelectedMember] = useState<TreeMember | null>(null);
    const [displayRootId, setDisplayRootId] = useState<string | null>(null);
    const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

    const toggleExpand = useCallback((memberId: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(memberId)) next.delete(memberId);
            else next.add(memberId);
            return next;
        });
    }, []);

    const handleMemberClick = useCallback((member: TreeMember) => {
        setSelectedMember(member);
    }, []);

    const handleSpouseClick = useCallback((spouse: Spouse, parentMember: TreeMember) => {
        const pseudoMember: TreeMember = {
            id: spouse.id,
            full_name: spouse.full_name,
            gender: parentMember.gender === "male" ? "female" : "male",
            generation_level: parentMember.generation_level,
            birth_order: 0,
            father_id: null,
            mother_id: null,
            metadata: spouse.metadata,
            created_at: spouse.created_at,
            updated_at: spouse.updated_at,
            spouses: [],
        };
        setSelectedMember(pseudoMember);
    }, []);

    const handleRootChange = useCallback((rootId: string | null) => {
        setDisplayRootId(rootId);
        setExpandedIds(new Set());
    }, []);

    // Build hierarchy and compute layout
    const { nodes, links, svgWidth, svgHeight } = useMemo(() => {
        const rootNode = buildTreeHierarchy(members, spouses, displayRootId);
        if (!rootNode) {
            return { nodes: [], links: [], svgWidth: 800, svgHeight: 600 };
        }

        rootNode.eachBefore((node) => {
            if (node.children) {
                const isRoot = node.data.id === rootNode.data.id;
                const isExpanded = isRoot || expandedIds.has(node.data.id);

                if (!isExpanded) {
                    (node as any)._children = node.children;
                    node.children = undefined;
                }
            }
        });

        const treeLayout = d3Tree<TreeMember>()
            .nodeSize([H_SPACING, V_SPACING])
            .separation((a, b) => {
                const aSpouses = a.data.spouses?.length || 0;
                const bSpouses = b.data.spouses?.length || 0;
                const aW = aSpouses > 0 ? 2 : 1;
                const bW = bSpouses > 0 ? 2 : 1;
                let sep = (aW + bW) / 2;
                if (a.parent !== b.parent) {
                    sep += 0.5;
                }
                return sep;
            });

        const layoutRoot = treeLayout(rootNode);
        const allNodes = layoutRoot.descendants();
        const allLinks = layoutRoot.links();

        let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity;

        for (const node of allNodes) {
            const spousesCount = node.data.spouses?.length || 0;
            const extraWidth = spousesCount * (NODE_WIDTH + 20);
            const nodeLeft = node.x - NODE_WIDTH / 2;
            const nodeRight = node.x + NODE_WIDTH / 2 + extraWidth;

            if (nodeLeft < minX) minX = nodeLeft;
            if (nodeRight > maxX) maxX = nodeRight;
            if (node.y < minY) minY = node.y;
            if (node.y > maxY) maxY = node.y;
        }

        const offsetX = -minX + PADDING;
        const offsetY = -minY + PADDING + NODE_HEIGHT / 2;

        for (const node of allNodes) {
            node.x += offsetX;
            node.y += offsetY;
        }

        const width = maxX - minX + PADDING * 2;
        const height = maxY - minY + NODE_HEIGHT + PADDING * 2;

        return {
            nodes: allNodes,
            links: allLinks,
            svgWidth: Math.max(width, 800),
            svgHeight: Math.max(height, 600),
        };
    }, [members, spouses, expandedIds, displayRootId]);

    // ─── Search and Pan ───────────────────────────────────────────────────────
    const handleSearchSelect = useCallback(
        (memberId: string) => {
            // Find path to expand
            const pathIds = new Set<string>();
            let targetNode = members.find((m) => m.id === memberId);

            while (targetNode?.father_id) {
                pathIds.add(targetNode.father_id);
                targetNode = members.find((m) => m.id === targetNode?.father_id);
            }

            // Force expand all parents
            setExpandedIds((prev) => {
                const next = new Set(prev);
                pathIds.forEach(id => next.add(id));
                return next;
            });

            // Need to wait for next render so D3 coordinates update
            setTimeout(() => {
                // Find node after layout update
                const renderRoot = buildTreeHierarchy(members, spouses, displayRootId);
                // We fake the apply expand/collapse logic to find exact coordinates
                if (renderRoot) {
                    renderRoot.eachBefore((n) => {
                        if (n.children) {
                            const isRt = n.data.id === renderRoot.data.id;
                            const isExp = isRt || pathIds.has(n.data.id) || expandedIds.has(n.data.id);
                            if (!isExp) {
                                n.children = undefined;
                            }
                        }
                    });

                    const treeLayout = d3Tree<TreeMember>()
                        .nodeSize([H_SPACING, V_SPACING])
                        .separation((a, b) => {
                            const aS = a.data.spouses?.length || 0;
                            const bS = b.data.spouses?.length || 0;
                            return ((aS > 0 ? 2 : 1) + (bS > 0 ? 2 : 1)) / 2 + (a.parent !== b.parent ? 0.5 : 0);
                        });

                    const lRoot = treeLayout(renderRoot);
                    const tNode = lRoot.descendants().find(n => n.data.id === memberId);

                    if (tNode && transformRef.current) {
                        // Recompute offsets identical to useMemo
                        let minX = Infinity, minY = Infinity;
                        for (const n of lRoot.descendants()) {
                            const sC = n.data.spouses?.length || 0;
                            const nL = n.x - NODE_WIDTH / 2;
                            if (nL < minX) minX = nL;
                            if (n.y < minY) minY = n.y;
                        }
                        const oX = -minX + PADDING;
                        const oY = -minY + PADDING + NODE_HEIGHT / 2;

                        const finalX = tNode.x + oX;
                        const finalY = tNode.y + oY;

                        // Pan and zoom
                        transformRef.current.setTransform(
                            -finalX + window.innerWidth / 2,
                            -finalY + window.innerHeight / 2,
                            1,
                            500
                        );

                        // Highlight
                        setHighlightedNodeId(memberId);
                        setTimeout(() => setHighlightedNodeId(null), 3500);
                    }
                }
            }, 100);
        },
        [members, spouses, displayRootId, expandedIds]
    );


    // ─── Toolbar actions ──────────────────────────────────────────────────────
    const handleZoomIn = useCallback(() => transformRef.current?.zoomIn(0.3), []);
    const handleZoomOut = useCallback(() => transformRef.current?.zoomOut(0.3), []);
    const handleReset = useCallback(() => transformRef.current?.resetTransform(), []);
    const handleFitScreen = useCallback(() => transformRef.current?.centerView(0.7, 300), []);

    // ─── Build bezier link path ───────────────────────────────────────────────
    const buildLinkPath = useCallback(
        (source: HierarchyPointNode<TreeMember>, target: HierarchyPointNode<TreeMember>) => {
            const spousesCount = source.data.spouses?.length || 0;
            const extraWidth = spousesCount * (NODE_WIDTH + 20);
            const sourceStartX = source.x + extraWidth / 2;
            const midY = (source.y + target.y) / 2;
            return `M${sourceStartX},${source.y + NODE_HEIGHT / 2} C${sourceStartX},${midY} ${target.x},${midY} ${target.x},${target.y - NODE_HEIGHT / 2 + 10}`;
        },
        [],
    );

    if (!members.length) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-muted-foreground text-lg">
                    Chưa có dữ liệu thành viên để hiển thị.
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-transparent">
            {/* Premium Header */}
            <TreeHeader />

            {/* Top UI elements container */}
            <div className="absolute top-4 inset-x-4 z-30 flex items-start justify-between pointer-events-none">
                <div className="pointer-events-auto">
                    <RootSelector
                        members={members}
                        currentRootId={displayRootId}
                        onRootChange={handleRootChange}
                    />
                </div>
                <div className="pointer-events-auto">
                    <TreeSearch members={members} onSelectMember={handleSearchSelect} />
                </div>
            </div>

            <TransformWrapper
                ref={transformRef}
                initialScale={0.75}
                minScale={0.15}
                maxScale={2.5}
                centerOnInit
                limitToBounds={false}
                wheel={{ step: 0.08 }}
                panning={{ velocityDisabled: true }}
            >
                <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: svgWidth, height: svgHeight }}
                >
                    <svg
                        width={svgWidth}
                        height={svgHeight}
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="select-none relative z-10"
                        role="img"
                        aria-label="Cây gia phả dòng họ"
                    >
                        {/* Links */}
                        <g className="links">
                            {links.map((link, i) => (
                                <path
                                    key={`link-${i}`}
                                    d={buildLinkPath(link.source, link.target)}
                                    fill="none"
                                    stroke="hsl(40 60% 40% / 0.5)"
                                    strokeWidth={2}
                                    className="transition-colors duration-300"
                                />
                            ))}
                        </g>

                        {/* Nodes */}
                        <g className="nodes">
                            {nodes.map((node) => (
                                <TreeMemberNode
                                    key={node.data.id}
                                    member={node.data}
                                    x={node.x}
                                    y={node.y}
                                    hasHiddenChildren={!!(node as any)._children}
                                    isExpanded={expandedIds.has(node.data.id)}
                                    onToggleExpand={() => toggleExpand(node.data.id)}
                                    onMemberClick={handleMemberClick}
                                    onSpouseClick={handleSpouseClick}
                                    isRoot={node.depth === 0}
                                    isHighlighted={highlightedNodeId === node.data.id}
                                />
                            ))}
                        </g>
                    </svg>
                </TransformComponent>
            </TransformWrapper>

            {/* Toolbar */}
            <TreeToolbar
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
                onFitScreen={handleFitScreen}
            />

            {/* Member Detail Modal */}
            {selectedMember && (
                <MemberDetailModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}
        </div>
    );
}
