"use client";

import { useState, useMemo } from "react";
import TreeDesktop from "@/components/tree/tree-desktop";
import { TreeBanner } from "@/components/tree/tree-banner";
import { TreeSidebar } from "@/components/tree/tree-sidebar";
import { TreeNavButtons } from "@/components/tree/tree-nav-buttons";
import { MemberProfileModal } from "@/components/tree/member-profile-modal";
import { Member, Spouse } from "@/lib/types";

interface TreeClientProps {
  initialMembers: Member[];
  initialSpouses: Spouse[];
  defaultRootId: string | null;
}

export default function TreeClient({
  initialMembers,
  initialSpouses,
  defaultRootId,
}: TreeClientProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden tree-page-bg">
      <TreeBanner />
      <TreeNavButtons />

      <TreeSidebar
        members={initialMembers}
        onSelectMember={handleSelectMember}
      />

      <div className="absolute inset-0 z-10">
        <TreeDesktop
          members={initialMembers}
          spouses={initialSpouses}
          onNodeClick={handleSelectMember}
        />
      </div>

      <MemberProfileModal
        member={selectedMember}
        spouses={initialSpouses}
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
      />
    </div>
  );
}
