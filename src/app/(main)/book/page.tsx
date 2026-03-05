"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getAllMembers, getAllSpouses } from "@/lib/supabase-data";
import { Member, Spouse, MemberMetadata } from "@/lib/types";
import { BookOpen, ChevronDown, ChevronRight, Loader2, Download, Scroll, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

type FamilyBranch = {
  member: Member;
  children: FamilyBranch[];
  spouses: Spouse[];
};

function buildFamilyTree(members: Member[], spouses: Spouse[]): FamilyBranch[] {
  const map = new Map<string, Member>(members.map((m) => [m.id, m]));
  const spouseByMember = new Map<string, Spouse[]>();
  spouses.forEach((s) => {
    if (!spouseByMember.has(s.member_id)) spouseByMember.set(s.member_id, []);
    spouseByMember.get(s.member_id)!.push(s);
  });

  const childrenOf = new Map<string, Member[]>();
  members.forEach((m) => {
    if (m.father_id && map.has(m.father_id)) {
      if (!childrenOf.has(m.father_id)) childrenOf.set(m.father_id, []);
      childrenOf.get(m.father_id)!.push(m);
    }
  });

  const hasParent = new Set(
    members.filter((m) => m.father_id && map.has(m.father_id)).map((m) => m.id),
  );
  const roots = members.filter(
    (m) => !hasParent.has(m.id) && m.gender === "male",
  );

  const buildBranch = (m: Member): FamilyBranch => ({
    member: m,
    children: (childrenOf.get(m.id) ?? [])
      .sort((a, b) => (a.birth_order ?? 0) - (b.birth_order ?? 0))
      .map(buildBranch),
    spouses: spouseByMember.get(m.id) ?? [],
  });

  return roots.map(buildBranch);
}

function BranchSection({
  branch,
  depth = 0,
}: {
  branch: FamilyBranch;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const { member, spouses, children } = branch;
  const meta = (member.metadata as MemberMetadata) || {};
  const yearRange = [meta.birth_year, meta.death_year]
    .filter(Boolean)
    .join("\u2013");

  return (
    <div
      className={cn(
        "border-l-2 pl-6 mb-6 transition-all duration-300",
        depth === 0
          ? "border-heritage-gold shadow-[inset_4px_0_10px_rgba(230,200,117,0.1)]"
          : depth === 1
            ? "border-heritage-gold/40"
            : "border-heritage-gold/10",
      )}
    >
      <div className="flex items-start gap-4 mb-3 group">
        <button
          className="mt-1.5 text-heritage-gold-dim hover:text-heritage-gold transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Thu gọn" : "Mở rộng"}
        >
          {children.length > 0 ? (
            open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4 h-4 block opacity-20">—</span>
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={cn(
                "font-serif font-bold transition-all duration-300 group-hover:tracking-wide",
                depth === 0
                  ? "text-xl royal-text-gradient"
                  : depth === 1
                    ? "text-base text-heritage-gold/90"
                    : "text-sm text-heritage-gold/70",
              )}
            >
              {member.full_name}
            </span>
            {yearRange && (
              <span className="text-[10px] font-mono text-heritage-gold-dim/60 bg-heritage-gold/5 px-2 py-0.5 rounded-full border border-heritage-gold/10">
                {yearRange}
              </span>
            )}
            {meta.is_alive === false && (
              <span className="text-xs text-heritage-gold-dim/40 italic">
                {"\u271D"}
              </span>
            )}
          </div>
          {spouses.map((s) => {
            const sMeta = (s.metadata as MemberMetadata) || {};
            return (
              <p key={s.id} className="text-[11px] text-rose-400/60 mt-1 font-medium italic">
                {"\u2665"} <span className="opacity-80">{s.full_name}</span>
                {sMeta.birth_year && (
                  <span className="ml-1 opacity-50">
                    (
                    {[sMeta.birth_year, sMeta.death_year]
                      .filter(Boolean)
                      .join("\u2013")}
                    )
                  </span>
                )}
              </p>
            );
          })}
        </div>
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 shadow-lg",
            member.gender === "male"
              ? "royal-halo bg-heritage-gold/10 text-heritage-gold"
              : "royal-halo-pink bg-rose-500/10 text-rose-400",
          )}
        >
          {member.generation_level}
        </div>
      </div>

      {open && children.length > 0 && (
        <div className="pl-4 space-y-2 animate-in fade-in slide-in-from-left-2 duration-500">
          {children.map((child) => (
            <BranchSection
              key={child.member.id}
              branch={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [spouses, setSpouses] = useState<Spouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([getAllMembers(), getAllSpouses()]).then(([m, s]) => {
      setMembers(m);
      setSpouses(s);
      setLoading(false);
    });
  }, []);

  const roots = useMemo(
    () => buildFamilyTree(members, spouses),
    [members, spouses],
  );

  const stats = useMemo(
    () => ({
      total: members.length,
      alive: members.filter(
        (m) => (m.metadata as MemberMetadata)?.is_alive !== false,
      ).length,
      gens: new Set(members.map((m) => m.generation_level)).size,
    }),
    [members],
  );

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try {
      const { generateGiaPhaPDF } = await import("@/lib/pdf-generator");
      const blob = await generateGiaPhaPDF(members, spouses);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Gia_Pha_Tran_Toc_My_Nguyen_${new Date().getFullYear()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã tải xuống file PDF gia phả!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Có lỗi khi xuất PDF. Vui lòng thử lại.");
    }
    setExporting(false);
  }, [members, spouses]);

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-heritage-gold/10 glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center shadow-xl">
              <BookOpen className="w-5 h-5 text-heritage-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold royal-text-gradient leading-none">
                Sách Gia Phả
              </h1>
              <p className="text-xs text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
                Văn bản truyền thừa đời đời của dòng tộc Trần Mỹ Nguyên
              </p>
            </div>
          </div>
          {!loading && members.length > 0 && (
            <Button
              size="sm"
              className="gold-gradient border-0 text-amber-950 font-bold hover:opacity-90 gap-1.5 shadow-2xl"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Xuất PDF Di Sản
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full space-y-24">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-heritage-gold" />
            </div>
          ) : (
            <div className="animate-in fade-in duration-1000">
              {/* Cover Title */}
              <div className="text-center space-y-12 relative py-20">
                <div className="relative inline-block group">
                  <div className="absolute -inset-10 bg-heritage-gold/5 blur-[80px] rounded-full opacity-50" />
                  <Scroll className="w-24 h-24 text-heritage-gold/40 mx-auto mb-10 hero-logo" />

                  <div className="relative space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <div className="h-px w-16 bg-gradient-to-r from-transparent to-heritage-gold/40" />
                      <Medal className="w-6 h-6 text-heritage-gold/60" />
                      <div className="h-px w-16 bg-gradient-to-l from-transparent to-heritage-gold/40" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-serif font-extrabold royal-text-gradient tracking-[0.2em] uppercase">
                      Gia Phả
                    </h2>
                    <h3 className="text-xl md:text-2xl font-serif font-medium text-heritage-gold-dim tracking-[0.3em] italic">
                      TRẦN TỘC MỸ NGUYÊN
                    </h3>
                    <p className="text-[10px] text-heritage-gold/40 uppercase tracking-[0.5em] mt-10">
                      Lưu truyền bách thế · Hưng thịnh ngàn đời
                    </p>
                  </div>
                </div>

                {/* Stats Summary Panel */}
                <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 p-8 rounded-[2rem] bg-royal-card/50 border border-heritage-gold/10 royal-gold-glow backdrop-blur-xl">
                  <div className="space-y-2">
                    <p className="text-3xl font-serif font-bold royal-text-gradient">{stats.total}</p>
                    <p className="text-[9px] font-bold text-heritage-gold-dim uppercase tracking-widest">Thành viên</p>
                  </div>
                  <div className="space-y-2 border-x border-heritage-gold/5">
                    <p className="text-3xl font-serif font-bold royal-text-gradient">{stats.gens}</p>
                    <p className="text-[9px] font-bold text-heritage-gold-dim uppercase tracking-widest">Thế hệ</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-serif font-bold royal-text-gradient">{stats.alive}</p>
                    <p className="text-[9px] font-bold text-heritage-gold-dim uppercase tracking-widest">Hiền diện</p>
                  </div>
                </div>
              </div>

              {/* Main Contents Section */}
              <section className="space-y-12">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-heritage-gold/30" />
                  <span className="text-xs font-bold uppercase tracking-[0.4em] text-heritage-gold-dim">
                    I. Phả Hệ Dòng Tộc
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-heritage-gold/30" />
                </div>

                <Card className="p-10 border-heritage-gold/10 bg-heritage-maroon/10">
                  {roots.map((branch) => (
                    <BranchSection
                      key={branch.member.id}
                      branch={branch}
                      depth={0}
                    />
                  ))}
                </Card>
              </section>

              {/* Statistics by Generation Section */}
              <section className="space-y-12 py-20">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-heritage-gold/30" />
                  <span className="text-xs font-bold uppercase tracking-[0.4em] text-heritage-gold-dim">
                    II. Thống Kê Chi Tiết
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-heritage-gold/30" />
                </div>

                <div className="grid grid-cols-1 gap-10">
                  {Array.from(new Set(members.map((m) => m.generation_level)))
                    .sort((a, b) => a - b)
                    .map((gen) => {
                      const genMembers = members.filter(
                        (m) => m.generation_level === gen,
                      );
                      return (
                        <Card
                          key={gen}
                          className="p-8 border-heritage-gold/10 hover:royal-gold-glow group transition-all duration-700 overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-gold/5 blur-[60px] rounded-full group-hover:bg-heritage-gold/10 transition-colors" />
                          <div className="flex justify-between items-end mb-8 border-b border-heritage-gold/10 pb-6">
                            <div>
                              <p className="text-2xl font-serif font-bold royal-text-gradient">
                                Đời thứ {gen}
                              </p>
                              <p className="text-[10px] font-bold text-heritage-gold-dim uppercase tracking-[0.2em] mt-1 opacity-60">
                                Giai đoạn tiếp nối tổ tiên
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-4xl font-serif font-bold text-heritage-gold/10 group-hover:text-heritage-gold/20 transition-colors">
                                {genMembers.length}
                              </span>
                              <span className="text-[9px] font-bold text-heritage-gold-dim ml-3 uppercase tracking-tighter opacity-40">
                                Nhân khẩu
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                            {genMembers.map((m) => {
                              const mMeta = (m.metadata as MemberMetadata) || {};
                              return (
                                <div
                                  key={m.id}
                                  className="flex items-center justify-between group/item p-2 rounded-lg hover:bg-heritage-gold/5 transition-all"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      m.gender === 'male' ? "bg-heritage-gold/40" : "bg-rose-500/40"
                                    )} />
                                    <span className="text-sm font-medium text-heritage-gold/80 truncate group-hover/item:text-heritage-gold transition-colors">
                                      {m.full_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {(mMeta.birth_year || mMeta.death_year) && (
                                      <span className="text-[10px] font-mono text-heritage-gold-dim/40 tabular-nums">
                                        {[mMeta.birth_year, mMeta.death_year]
                                          .filter(Boolean)
                                          .join("-")}
                                      </span>
                                    )}
                                    {mMeta.is_alive === false && (
                                      <span className="text-[10px] text-heritage-gold/30">
                                        {"\u271D"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </section>

              {/* Footer Script */}
              <div className="text-center py-20 opacity-20 space-y-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-heritage-gold to-transparent mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-heritage-gold">
                  GIA PHẢ TỰ ĐỘNG · HỆ THỐNG TRẦN MỸ NGUYÊN
                </p>
                <p className="text-[8px] font-medium text-heritage-gold-dim">
                  Bản cập nhật ngày {new Date().toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
