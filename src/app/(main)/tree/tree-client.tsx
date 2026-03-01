"use client";

import { useSearchParams } from "next/navigation";
import { Member, Spouse } from "@/lib/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TreeDesktop } from "@/components/tree/tree-desktop";
import { TreeMobile } from "@/components/tree/tree-mobile";
import { TreeHeader, ViewMode } from "@/components/tree/tree-header";
import { useState, useEffect } from "react";

export default function TreeClient({
  defaultRootId,
  initialMembers = [],
  initialSpouses = [],
}: {
  defaultRootId?: string | null;
  initialMembers?: Member[];
  initialSpouses?: Spouse[];
}) {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const urlRootId = searchParams.get("root");

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);

  // Mặc định: Mobile -> List, Desktop -> Tree
  const [viewMode, setViewMode] = useState<ViewMode>("tree");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Chỉ effect lần đầu khi resolve được isDesktop
  useEffect(() => {
    if (mounted) {
      setViewMode(isDesktop ? "tree" : "list");
    }
  }, [mounted, isDesktop]);

  if (!mounted) {
    return <div className="w-full h-full bg-[var(--color-heritage-maroon)]"></div>;
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[var(--color-heritage-maroon)]">
      {/* Background Hoa văn cổ điển */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e6c875' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}
      />

      <TreeHeader viewMode={viewMode} setViewMode={setViewMode} isMobile={!isDesktop} />

      {/* Khung Render Chính */}
      <div className="absolute inset-0 z-10 pt-28">
        {viewMode === "tree" ? (
          <TreeDesktop
            members={initialMembers}
            spouses={initialSpouses}
            defaultRootId={urlRootId || defaultRootId}
            isMobile={!isDesktop}
          />
        ) : (
          <TreeMobile
            members={initialMembers}
            spouses={initialSpouses}
            defaultRootId={urlRootId || defaultRootId}
          />
        )}
      </div>
    </div>
  );
}
