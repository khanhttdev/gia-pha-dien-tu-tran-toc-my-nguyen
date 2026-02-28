"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllMembers, getAllSpouses } from "@/lib/supabase-data";
import { Member, Spouse, MemberMetadata } from "@/lib/types";
import { BookOpen, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "border-l-2 pl-4 mb-4",
        depth === 0
          ? "border-amber-500/60"
          : depth === 1
            ? "border-amber-400/30"
            : "border-border/40",
      )}
    >
      <div className="flex items-start gap-3 mb-2">
        <button
          className="mt-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Thu g\u1ECDn" : "M\u1EDF r\u1ED9ng"}
        >
          {children.length > 0 ? (
            open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4 h-4 block" />
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "font-bold",
                depth === 0
                  ? "text-base text-amber-600"
                  : depth === 1
                    ? "text-sm text-amber-700/80"
                    : "text-sm text-foreground/90",
              )}
            >
              {member.full_name}
            </span>
            {yearRange && (
              <span className="text-xs text-muted-foreground">
                ({yearRange})
              </span>
            )}
            {meta.is_alive === false && (
              <span className="text-xs text-muted-foreground/60 italic">
                {"\u271D"}
              </span>
            )}
          </div>
          {spouses.map((s) => {
            const sMeta = (s.metadata as MemberMetadata) || {};
            return (
              <p key={s.id} className="text-xs text-muted-foreground mt-0.5">
                {"\u2665"} <span className="font-medium">{s.full_name}</span>
                {sMeta.birth_year && (
                  <span className="ml-1">
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
            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
            "border",
            member.gender === "male"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
              : "bg-rose-400/10 border-rose-400/30 text-rose-400",
          )}
        >
          {member.generation_level}
        </div>
      </div>

      {open && children.length > 0 && (
        <div className="pl-4 space-y-0">
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

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 border-b border-border glass">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-amber-900" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">
              S&aacute;ch Gia Ph&#7843;
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tr&#7847;n T&#7897;c M&#7929; Nguy&ecirc;n &mdash; t&#7921;
              &#273;&#7897;ng t&#7841;o t&#7915; d&#7919; li&#7879;u
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="pb-8">
            {/* Header */}
            <div className="text-center mb-16 relative">
              <div className="text-7xl mb-8 opacity-90 hero-logo">
                {"\uD83D\uDCD6"}
              </div>
              <div className="relative inline-block px-12 py-4">
                <div className="absolute top-0 left-0 w-12 h-0.5 bg-amber-500/40" />
                <div className="absolute top-0 right-0 w-12 h-0.5 bg-amber-500/40" />
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-amber-500/40" />
                <div className="absolute bottom-0 right-0 w-12 h-0.5 bg-amber-500/40" />
                <h2 className="text-4xl font-serif font-extrabold gold-text tracking-[0.15em] uppercase">
                  GIA PH&#7842;
                </h2>
                <h3 className="text-lg font-serif font-medium text-amber-200/60 mt-2 tracking-widest italic">
                  TR&#7846;N T&#7896;C M&#7928; NGUY&Ecirc;N
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-8 uppercase tracking-[0.3em] opacity-40">
                L&#432;u gi&#7919; &mdash; Truy&#7873;n th&#7915;a &mdash;
                Ph&aacute;t tri&#7875;n
              </p>

              <div className="grid grid-cols-3 gap-12 mt-16 max-w-xl mx-auto">
                <div className="space-y-1">
                  <div className="text-2xl font-serif font-bold text-amber-500/80">
                    {stats.total}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Th&agrave;nh vi&ecirc;n
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-serif font-bold text-amber-500/80">
                    {stats.gens}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Th&#7871; h&#7879;
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-serif font-bold text-amber-500/80">
                    {stats.alive}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    C&ograve;n s&#7889;ng
                  </div>
                </div>
              </div>
            </div>

            {/* Family Tree Section */}
            <div className="space-y-6 mt-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/40" />
                <h3 className="text-[10px] font-semibold text-amber-500/40 uppercase tracking-[0.4em]">
                  Ph&#7843; H&#7879; D&ograve;ng T&#7897;c
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/40" />
              </div>
              {roots.map((branch) => (
                <BranchSection
                  key={branch.member.id}
                  branch={branch}
                  depth={0}
                />
              ))}
            </div>

            {/* Genealogy Statistics Section */}
            <div className="mt-24 pt-16 border-t border-border/20">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/40" />
                <h3 className="text-[10px] font-semibold text-amber-500/40 uppercase tracking-[0.4em]">
                  Th&#7889;ng k&ecirc; Th&#7871; h&#7879;
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/40" />
              </div>
              <div className="grid grid-cols-1 gap-8">
                {Array.from(new Set(members.map((m) => m.generation_level)))
                  .sort()
                  .map((gen) => {
                    const genMembers = members.filter(
                      (m) => m.generation_level === gen,
                    );
                    return (
                      <div
                        key={gen}
                        className="glass rounded-3xl p-8 border border-border/40 shadow-2xl"
                      >
                        <div className="flex justify-between items-end mb-6 border-b border-border/10 pb-4">
                          <div>
                            <p className="text-lg font-serif font-semibold text-amber-500">
                              Th&#7871; h&#7879; th&#7913; {gen}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                              Giai &#273;o&#7841;n l&#432;u danh
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-serif font-bold text-foreground/20">
                              {genMembers.length}
                            </span>
                            <span className="text-[8px] text-muted-foreground ml-2 uppercase tracking-tighter">
                              Nh&acirc;n kh&#7849;u
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                          {genMembers.map((m) => {
                            const mMeta = (m.metadata as MemberMetadata) || {};
                            return (
                              <div
                                key={m.id}
                                className="flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground/30 text-[10px]">
                                    {m.gender === "male" ? "\u2642" : "\u2640"}
                                  </span>
                                  <span className="text-sm font-medium text-foreground/80">
                                    {m.full_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {(mMeta.birth_year || mMeta.death_year) && (
                                    <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums">
                                      {[mMeta.birth_year, mMeta.death_year]
                                        .filter(Boolean)
                                        .join("\u2013")}
                                    </span>
                                  )}
                                  {mMeta.is_alive === false && (
                                    <span className="text-[10px] text-amber-600/40">
                                      {"\u271D"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-32 text-center opacity-20">
              <p className="text-[10px] tracking-[0.5em] uppercase">
                Gia Ph&#7843; Tr&#7847;n T&#7897;c M&#7929; Nguy&ecirc;n
              </p>
              <p className="text-[8px] mt-2">
                &copy; {new Date().getFullYear()} &mdash; L&#432;u gi&#7919;
                b&#7903;i con ch&aacute;u &#273;&#7901;i &#273;&#7901;i
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
