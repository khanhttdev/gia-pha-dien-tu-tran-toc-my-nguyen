"use client";

import { useRouter } from "next/navigation";
import type { Member, Spouse, MemberMetadata } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    User2,
    Heart,
    TreePine,
    Baby,
    Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MemberProfileClientProps {
    member: Member;
    allMembers: Member[];
    allSpouses: Spouse[];
}

export default function MemberProfileClient({
    member,
    allMembers,
    allSpouses,
}: MemberProfileClientProps) {
    const router = useRouter();
    const meta = (member.metadata as MemberMetadata) || {};

    // ── Family relationships ───────────────────────────────────────────────────
    const father = allMembers.find((m) => m.id === member.father_id);
    const mother = allSpouses.find((s) => s.id === member.mother_id);
    const spouses = allSpouses.filter((s) => s.member_id === member.id);
    const children = allMembers.filter((m) => m.father_id === member.id);
    const siblings = allMembers
        .filter(
            (m) =>
                m.id !== member.id && m.father_id && m.father_id === member.father_id,
        )
        .sort((a, b) => (a.birth_order ?? 0) - (b.birth_order ?? 0));

    // ── Helpers ───────────────────────────────────────────────────────────────
    const genderLabel = member.gender === "male" ? "♂ Nam" : "♀ Nữ";
    const roleLabel = (r: string) =>
        ({
            chinh_that: "Chính thất",
            ke_that: "Kế thất",
            thu_that: "Thứ thất",
            chong: "Chồng",
        })[r] || r;

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16 space-y-6 animate-in fade-in-50 duration-500">
                {/* Back */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground -ml-2"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" /> Danh sách thành viên
                </Button>

                {/* ── Hero Card ─────────────────────────────────────────── */}
                <div className="glass rounded-2xl border border-border/50 overflow-hidden">
                    {/* Top gradient bar */}
                    <div
                        className={cn(
                            "h-1.5",
                            member.gender === "male"
                                ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                                : "bg-gradient-to-r from-rose-400 to-pink-500",
                        )}
                    />

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {/* Avatar */}
                            <div className="shrink-0">
                                {meta.avatar_url ? (
                                    <img
                                        src={meta.avatar_url}
                                        alt={member.full_name}
                                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-background shadow-xl"
                                    />
                                ) : (
                                    <div
                                        className={cn(
                                            "w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center ring-4 ring-background shadow-xl text-4xl",
                                            member.gender === "male"
                                                ? "bg-blue-500/10"
                                                : "bg-rose-400/10",
                                        )}
                                    >
                                        {member.gender === "male" ? "👨" : "👩"}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-tight">
                                            {member.full_name}
                                        </h1>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs",
                                                    member.gender === "male"
                                                        ? "border-blue-500/40 text-blue-500"
                                                        : "border-rose-400/40 text-rose-400",
                                                )}
                                            >
                                                {genderLabel}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                Thế hệ {member.generation_level}
                                            </Badge>
                                            {meta.is_alive === false ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-gray-500/40 text-muted-foreground"
                                                >
                                                    Đã mất
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-emerald-500/40 text-emerald-500"
                                                >
                                                    Còn sống
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                        onClick={() => router.push(`/tree?highlight=${member.id}`)}
                                    >
                                        <TreePine className="w-3.5 h-3.5" />
                                        Xem trên cây
                                    </Button>
                                </div>

                                {/* Key stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
                                    {(meta.birth_year || meta.death_year) && (
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                {meta.is_alive === false ? "Sinh – Mất" : "Năm sinh"}
                                            </p>
                                            <p className="font-semibold text-sm mt-0.5">
                                                {[meta.birth_year, meta.death_year]
                                                    .filter(Boolean)
                                                    .join(" – ")}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            Thứ tự sinh
                                        </p>
                                        <p className="font-semibold text-sm mt-0.5">
                                            Con thứ {member.birth_order ?? 1}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            Số con
                                        </p>
                                        <p className="font-semibold text-sm mt-0.5">
                                            {children.length} người
                                        </p>
                                    </div>
                                </div>

                                {/* Notes */}
                                {meta.notes && (
                                    <p className="text-sm text-muted-foreground mt-4 italic leading-relaxed border-l-2 border-amber-500/30 pl-3">
                                        {meta.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* family grid, children, siblings... (same as before) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Parents Card */}
                    <div className="glass rounded-xl border border-border/50 p-5 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-amber-500" /> Cha Mẹ
                        </h2>
                        {father ? (
                            <Link
                                href={`/people/${father.id}`}
                                className="flex items-center gap-3 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-lg shrink-0">
                                    👨
                                </div>
                                <div>
                                    <p className="text-sm font-medium group-hover:text-amber-500 transition-colors">
                                        {father.full_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Cha · Thế hệ {father.generation_level}
                                    </p>
                                </div>
                            </Link>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                Không có thông tin cha
                            </p>
                        )}
                        {mother ? (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-rose-400/10 border border-rose-400/30 flex items-center justify-center shrink-0">
                                    <Heart className="w-4 h-4 text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{mother.full_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Mẹ · {roleLabel(mother.role_type ?? "")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                Không có thông tin mẹ
                            </p>
                        )}
                    </div>

                    {/* Spouses Card */}
                    <div className="glass rounded-xl border border-border/50 p-5 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-rose-400" /> Phối Ngẫu (
                            {spouses.length})
                        </h2>
                        {spouses.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {spouses.map((sp) => (
                                    <div
                                        key={sp.id}
                                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-rose-400/10 border border-rose-400/30 flex items-center justify-center shrink-0">
                                            <Heart className="w-4 h-4 text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{sp.full_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {roleLabel(sp.role_type ?? "")} ·
                                                {sp.status === "married"
                                                    ? " Đang kết hôn"
                                                    : sp.status === "divorced"
                                                        ? " Đã ly hôn"
                                                        : " Đã mất"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                Chưa có thông tin phối ngẫu
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Children ──────────────────────────────────────────── */}
                {children.length > 0 && (
                    <div className="glass rounded-xl border border-border/50 p-5 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Baby className="w-3.5 h-3.5 text-emerald-500" /> Con Cái (
                            {children.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {children.map((child) => {
                                const childMeta = (child.metadata as MemberMetadata) || {};
                                return (
                                    <Link
                                        key={child.id}
                                        href={`/people/${child.id}`}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-sm border shrink-0",
                                                child.gender === "male"
                                                    ? "bg-blue-500/10 border-blue-500/30"
                                                    : "bg-rose-400/10 border-rose-400/30",
                                            )}
                                        >
                                            {child.gender === "male" ? "👦" : "👧"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-amber-500 transition-colors">
                                                {child.full_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {childMeta.birth_year
                                                    ? `Sinh ${childMeta.birth_year}`
                                                    : `Con thứ ${child.birth_order ?? 1}`}
                                            </p>
                                        </div>
                                        {childMeta.is_alive === false && (
                                            <Badge variant="outline" className="text-[10px] shrink-0">
                                                Đã mất
                                            </Badge>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Siblings ──────────────────────────────────────────── */}
                {siblings.length > 0 && (
                    <div className="glass rounded-xl border border-border/50 p-5 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <User2 className="w-3.5 h-3.5 text-sky-400" /> Anh Chị Em (
                            {siblings.length})
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {siblings.map((s) => (
                                <Link
                                    key={s.id}
                                    href={`/people/${s.id}`}
                                    className="flex items-center gap-2 px-3 py-1.5 glass rounded-full border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-sm group"
                                >
                                    <span>{s.gender === "male" ? "👦" : "👧"}</span>
                                    <span className="group-hover:text-amber-500 transition-colors">
                                        {s.full_name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
