"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dynamic from "next/dynamic";
import { PersonNode } from "@/components/tree/person-node";
import { buildTreeLayout } from "@/lib/tree-layout";
import { Member, Spouse } from "@/lib/types";
import { DetailPanel } from "@/components/tree/detail-panel";

// Lazy load heavy chart components
const ReactFlow = dynamic(
  () => import("@xyflow/react").then((mod) => mod.ReactFlow),
  { ssr: false },
);
const Controls = dynamic(
  () => import("@xyflow/react").then((mod) => mod.Controls),
  { ssr: false },
);
const MiniMap = dynamic(
  () => import("@xyflow/react").then((mod) => mod.MiniMap),
  { ssr: false },
);
const Background = dynamic(
  () => import("@xyflow/react").then((mod) => mod.Background),
  { ssr: false },
);

import { Search, Waypoints, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const nodeTypes = { person: PersonNode };

function TreeContent({
  members,
  spouses,
  defaultRootId,
}: {
  members: Member[];
  spouses: Spouse[];
  defaultRootId?: string | null;
}) {

  const { fitView, setCenter, getNodes } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [nodeLimit, setNodeLimit] = useState(200); // Massive view right from the start

  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const urlRootId = searchParams.get("root");

  const activeRootId = useMemo(() => {
    if (urlRootId) return urlRootId;
    if (defaultRootId) return defaultRootId;
    if (!members.length) return null;
    const oldest = [...members].sort(
      (a, b) => a.generation_level - b.generation_level,
    )[0];
    return oldest?.id || null;
  }, [urlRootId, defaultRootId, members]);

  const ancestryTrail = useMemo(() => {
    const targetId = selected?.id || activeRootId;
    if (!targetId || !members.length) return [];

    const trail: Member[] = [];
    let currId: string | null = targetId;
    let safety = 0;

    while (currId && safety < 100) {
      const member = members.find((m) => m.id === currId);
      if (member) {
        trail.unshift(member);
        currId = member.father_id;
      } else {
        currId = null;
      }
      safety++;
    }
    return trail;
  }, [members, activeRootId, selected]);

  const { displayMembers, hasMore, totalInTree } = useMemo(() => {
    if (!activeRootId)
      return {
        displayMembers: members,
        hasMore: false,
        totalInTree: members.length,
      };

    const childrenMap = new Map<string, string[]>();
    members.forEach((m) => {
      if (m.father_id) {
        if (!childrenMap.has(m.father_id)) childrenMap.set(m.father_id, []);
        childrenMap.get(m.father_id)!.push(m.id);
      }
    });

    const orderedNodes: string[] = [];
    const visited = new Set<string>();
    const queue = [activeRootId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (visited.has(curr)) continue;
      visited.add(curr);
      orderedNodes.push(curr);
      const children = childrenMap.get(curr) || [];
      queue.push(...children);
    }

    let effectiveLimit = nodeLimit;

    if (focusId && visited.has(focusId)) {
      const idx = orderedNodes.indexOf(focusId);
      if (idx >= effectiveLimit) effectiveLimit = idx + 1;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matches = members.filter(
        (m) => visited.has(m.id) && m.full_name.toLowerCase().includes(q),
      );
      if (matches.length > 0) {
        const maxIdx = Math.max(
          ...matches.map((m) => orderedNodes.indexOf(m.id)),
        );
        if (maxIdx >= effectiveLimit) effectiveLimit = maxIdx + 1;
      }
    }

    const resultIds = new Set(orderedNodes.slice(0, effectiveLimit));
    const resultMembers = members.filter((m) => resultIds.has(m.id));

    console.log(`[VIP Debug] limit=${nodeLimit}, effective=${effectiveLimit}, displayed=${resultMembers.length}`);

    return {
      displayMembers: resultMembers,
      hasMore: effectiveLimit < orderedNodes.length,
      totalInTree: orderedNodes.length,
    };
  }, [members, activeRootId, nodeLimit, focusId, search]);

  useEffect(() => {
    if (!focusId) return;
    const m = displayMembers.find((x) => x.id === focusId);
    if (m) setSelected(m);
  }, [focusId, displayMembers]);

  const prevRootId = useRef<string | null>(null);
  useEffect(() => {
    const { nodes: n, edges: e } = buildTreeLayout(displayMembers, spouses);

    // Inject isActiveRoot into node data
    const nodesWithExtra = n.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActiveRoot: node.id === activeRootId,
        isHighlighted: false // Will be updated by highlighted effect
      }
    }));

    setNodes(nodesWithExtra);
    setEdges(e);

    if (prevRootId.current !== activeRootId) {
      prevRootId.current = activeRootId;
      setTimeout(() => fitView({ padding: 0.2 }), 300);
    }
  }, [displayMembers, spouses, setNodes, setEdges, activeRootId, fitView]);

  const filtered = useMemo(() => {
    if (!search.trim()) return new Set<string>();
    const q = search.toLowerCase();
    return new Set(
      displayMembers
        .filter((m) => m.full_name.toLowerCase().includes(q))
        .map((m) => m.id),
    );
  }, [search, displayMembers]);

  useEffect(() => {
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted:
            (filtered.size > 0 && filtered.has(n.id)) || n.id === focusId,
        },
      })),
    );

    if ((filtered.size === 1 || focusId) && (search.trim() || focusId)) {
      const idToFocus = focusId || Array.from(filtered)[0];
      const currentNodes = getNodes();
      const node = currentNodes.find((n: Node) => n.id === idToFocus);
      if (node) {
        setTimeout(
          () =>
            setCenter(node.position.x + 150, node.position.y + 50, {
              zoom: 1.0,
              duration: 600,
            }),
          100,
        );
      }
    }
  }, [search, focusId, setCenter, filtered, getNodes, setNodes]);

  const onNodeClick: NodeMouseHandler<Node> = useCallback(
    (_evt, node) => {
      const m = displayMembers.find((x) => x.id === node.id);
      if (m) {
        setSelected(m);
        setIsPanelOpen(true);
      }
    },
    [displayMembers],
  );

  // Infinite Scroll handler - Tự động tải thêm khi cuộn chuột
  const handleMoveEnd = useCallback((event: any) => {
    // Only load more if it was a user interaction (event is not null/undefined)
    if (event && hasMore) {
      setNodeLimit((prev) => Math.min(prev + 15, totalInTree));
    }
  }, [hasMore, totalInTree]);

  const stats = useMemo(
    () => ({
      total: totalInTree,
      gens:
        displayMembers.length > 0
          ? new Set(displayMembers.map((m) => m.generation_level)).size
          : 0,
    }),
    [totalInTree, displayMembers],
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#180308] overflow-hidden relative font-serif">
      {/* Dark Maroon Mandala Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4A0A12] via-[#21050A] to-[#120205] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M60 0L48 12l12 12 12-12L60 0zm0 120l-12-12 12-12 12 12-12 12zm-60-60l12-12 12 12-12 12L0 60zm120 0l-12-12-12 12 12 12 12-12zM60 40l-20 20 20 20 20-20-20-20zm0 10l10 10-10 10-10-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '200px 200px', backgroundPosition: 'center' }}
      />

      {/* House Deveraux Style Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
        <header className="pointer-events-auto bg-[#131720]/95 backdrop-blur-xl border border-[#D4AF37]/40 rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] px-8 py-5 flex items-center gap-6 min-w-[500px]">
          {/* Glowing Tree Icon */}
          <div className="w-16 h-16 shrink-0 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#D4AF37]">
              <path d="M12 22C12 22 17 18 17 12V6L12 2L7 6V12C7 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15C12 15 15 13 15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 18C12 18 14 16.5 14 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15C12 15 9 13 9 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="flex flex-col items-center flex-1">
            <span className="text-[11px] font-black tracking-[0.2em] text-[#E8D9A8]/70 uppercase leading-none mb-2 font-sans">
              THE CHRONICLES OF
            </span>
            <h1 className="text-3xl font-black tracking-widest text-[#F5D061] uppercase leading-none drop-shadow-lg font-serif">
              HOUSE TRAN
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
              <span className="text-[12px] font-bold text-[#E8D9A8]/50 italic tracking-[0.3em] uppercase font-serif">
                Legacy & Lineage
              </span>
              <div className="w-16 h-[1.5px] bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
            </div>
          </div>
        </header>
      </div>

      {/* Controls Platform overlay (Right side) */}
      <div className="absolute top-6 right-6 z-[500] flex flex-col gap-3">
        <div className="bg-[#131720]/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg p-2 flex items-center gap-2 shadow-xl">
          <Search className="w-4 h-4 text-[#D4AF37]/60" />
          <Input
            placeholder="Search lineage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-48 bg-transparent border-none text-[12px] text-[#E8D9A8] placeholder:text-[#E8D9A8]/40 outline-none focus-visible:ring-0 font-sans"
          />
        </div>
        <div className="self-end px-3 py-1.5 bg-[#131720]/80 rounded border border-[#D4AF37]/20">
          <span className="text-[10px] font-bold text-[#D4AF37]/80 tracking-widest uppercase font-sans">
            Members: {displayMembers.length} / {stats.total}
          </span>
        </div>
      </div >

      {/* Ancestry Breadcrumbs - Floating Bottom Left */}
      <div className="absolute bottom-6 left-6 z-[400] max-w-[320px]">
        <div className="bg-[#131720]/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl p-3 shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase text-[#D4AF37]/60 tracking-widest flex items-center gap-2 font-sans">
              <Waypoints size={10} /> Phả Hệ Đang Xem
            </span>
            {(urlRootId ||
              (defaultRootId && activeRootId !== defaultRootId)) && (
                <button
                  onClick={() => (window.location.href = "/tree")}
                  className="text-[8px] text-amber-400 hover:text-amber-300 font-bold uppercase transition-colors"
                >
                  Về Thủy Tổ
                </button>
              )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {ancestryTrail.length > 0 ? (
              ancestryTrail.map((m, idx) => (
                <React.Fragment key={m.id}>
                  <button
                    onClick={() =>
                      (window.location.href = `/tree?root=${m.id}`)
                    }
                    className={cn(
                      "text-[9px] px-2 py-0.5 rounded transition-all border font-bold uppercase tracking-tighter whitespace-nowrap font-sans",
                      m.id === (selected?.id || activeRootId)
                        ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#F5D061] shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                        : "bg-white/5 border-white/5 text-[#E8D9A8]/40 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]",
                    )}
                  >
                    {m.full_name.split(" ").pop()}
                  </button>
                  {idx < ancestryTrail.length - 1 && (
                    <ChevronRight size={10} className="text-[#D4AF37]/20" />
                  )}
                </React.Fragment>
              ))
            ) : (
              <div className="text-[9px] text-[#E8D9A8]/20 italic font-sans">
                Chọn một nút để xem dòng tộc...
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden z-0">
        {/* Timeline - House Deveraux Style (1820, 1835...) */}
        <div className="absolute top-0 left-6 bottom-0 w-16 z-20 flex flex-col items-center py-40 gap-[6.5rem] pointer-events-none select-none">
          {[1820, 1835, 1850, 1865, 1880, 1895, 1910, 1925, 1940, 1955].map((year) => (
            <div key={year} className="flex flex-col items-center gap-1.5 group">
              <div className="text-[12px] font-black text-[#D4AF37]/40 rotate-180 [writing-mode:vertical-lr] tracking-[0.2em] font-serif">
                {year}
              </div>
            </div>
          ))}
        </div>

        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-[#1B0506]">
              <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
          }
        >
          <ReactFlow
            colorMode="dark"
            className="bg-transparent"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelected(null)}
            onMoveEnd={handleMoveEnd}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.05}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Controls className="!bg-[#1B0506]/80 !border-amber-600/30 shadow-2xl rounded-xl overflow-hidden p-1 [&>button]:!bg-transparent [&>button]:!border-none [&>button]:!fill-amber-500/50 hover:[&>button]:!fill-amber-400" />
            <MiniMap
              nodeColor={(n: Node) => {
                const m = (n.data as any)?.member;
                return m?.gender === "male"
                  ? "#3B82F6"
                  : m?.gender === "female"
                    ? "#EC4899"
                    : "#D97706";
              }}
              className="!bg-[#1B0506]/90 !border-amber-600/30 rounded-xl shadow-2xl overflow-hidden hidden md:block"
              maskColor="rgba(27, 5, 6, 0.8)"
            />
            <Background
              color="#F59E0B"
              gap={40}
              size={1}
              variant={undefined as any}
              className="opacity-[0.03]"
            />
          </ReactFlow>
        </Suspense>
      </main>

      <DetailPanel
        member={selected}
        spouses={spouses.filter((s) => s.member_id === selected?.id)}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div >
  );
}

export default function TreeClient({
  defaultRootId,
  initialMembers = [],
  initialSpouses = [],
}: {
  defaultRootId?: string | null;
  initialMembers?: Member[];
  initialSpouses?: Spouse[];
}) {
  const [members] = useState<Member[]>(initialMembers);
  const [spouses] = useState<Spouse[]>(initialSpouses);

  return (
    <div className="h-full flex flex-col bg-background font-sans antialiased overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        <ReactFlowProvider>
          <TreeContent
            members={members}
            spouses={spouses}
            defaultRootId={defaultRootId}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
