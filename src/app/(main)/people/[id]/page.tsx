import {
  getMemberById,
  getAllMembers,
  getAllSpouses,
} from "@/lib/supabase-data";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberProfileClient from "@/components/people/member-profile-client";
import type { MemberMetadata } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    return {
      title: "Thành viên không tồn tại",
    };
  }

  const meta = (member.metadata as MemberMetadata) || {};
  const description = `Thế hệ thứ ${member.generation_level}, vai vế con thứ ${member.birth_order ?? 1} trong dòng họ Trần Tộc Mỹ Nguyên. ${meta.notes || ""}`;

  return {
    title: `${member.full_name} | Gia Phả Trần Tộc Mỹ Nguyên`,
    description,
    openGraph: {
      title: `${member.full_name} - Di Sản Dòng Họ`,
      description,
      type: "profile",
      gender: member.gender,
    },
  };
}

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params;

  const [member, allMembers, allSpouses] = await Promise.all([
    getMemberById(id),
    getAllMembers(),
    getAllSpouses(),
  ]);

  if (!member) {
    notFound();
  }

  return (
    <MemberProfileClient
      member={member}
      allMembers={allMembers}
      allSpouses={allSpouses}
    />
  );
}
