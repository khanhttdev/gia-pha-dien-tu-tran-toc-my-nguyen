"use client";

import { useRouter } from "next/navigation";
import type { Member, Spouse, MemberMetadata } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft,
    User2,
    Heart,
    TreePine,
    Baby,
    Star,
    Calendar,
    MapPin,
    ChevronRight,
    Activity,
    Users,
    FileText,
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
    const genderLabel = member.gender === "male" ? "Nam" : "Nữ";
    const roleLabel = (r: string) =>
        ({
            chinh_that: "Chính thất",
            ke_that: "Kế thất",
            thu_that: "Thứ thất",
            chong: "Chồng",
        })[r] || r;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar page-enter">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 pb-20 space-y-10">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-heritage-gold-dim hover:text-heritage-gold hover:bg-heritage-gold/5 -ml-3 group transition-all"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Quay lại danh sách</span>
                    </Button>
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-heritage-gold animate-pulse"></div>
                        <span className="text-[10px] text-heritage-gold-dim/40 font-bold uppercase tracking-widest italic">Hồ sơ thế hệ {member.generation_level}</span>
                    </div>
                </div>

                {/* ── Hero Card ─────────────────────────────────────────── */}
                <div className="bg-royal-card border-heritage-gold/30 rounded-[2.5rem] royal-glass hover:royal-gold-glow transition-all duration-700 overflow-hidden relative">
                    {/* Top gradient bar */}
                    <div
                        className={cn(
                            "h-2 absolute top-0 left-0 w-full z-20",
                            member.gender === "male"
                                ? "bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600"
                                : "bg-gradient-to-r from-rose-600 via-pink-400 to-fuchsia-600",
                        )}
                    />

                    <div className="p-8 sm:p-12 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                            {/* Avatar Section */}
                            <div className="relative shrink-0 group">
                                <div
                                    className={cn(
                                        "w-36 h-36 rounded-[2.5rem] flex items-center justify-center p-1.5 transition-all duration-700 group-hover:scale-105",
                                        member.gender === "male"
                                            ? "royal-halo"
                                            : "royal-halo-pink"
                                    )}
                                >
                                    <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-black/60 relative">
                                        {meta.avatar_url ? (
                                            <img
                                                src={meta.avatar_url}
                                                alt={member.full_name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-2 text-5xl">
                                                {member.gender === "male" ? "👨" : "👩"}
                                            </div>
                                        )}
                                        {/* Status Badge Over Avatar */}
                                        <div className="absolute bottom-2 right-2">
                                            {meta.is_alive === false ? (
                                                <div className="bg-gray-900/80 border border-white/20 p-1.5 rounded-full shadow-lg" title="Đã về cội nguồn">
                                                    <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
                                                </div>
                                            ) : (
                                                <div className="bg-emerald-500/80 border border-white/20 p-1.5 rounded-full shadow-lg" title="Hiện hữu">
                                                    <Activity className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                                        <div>
                                            <h1 className="text-3xl sm:text-4xl font-serif font-black royal-text-gradient leading-tight mb-2">
                                                {member.full_name}
                                            </h1>
                                            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-2",
                                                        member.gender === "male"
                                                            ? "border-blue-500/30 text-blue-400 bg-blue-500/5"
                                                            : "border-rose-400/30 text-rose-400 bg-rose-400/5",
                                                    )}
                                                >
                                                    {genderLabel}
                                                </Badge>
                                                <Badge className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-heritage-gold text-amber-950 border-none shadow-lg">
                                                    Đời thứ {member.generation_level}
                                                </Badge>
                                                {meta.is_alive === false && (
                                                    <Badge className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                                        Sử sách ghi danh
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            className="gold-gradient text-amber-950 font-black gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-widest px-8 h-12 rounded-2xl"
                                            onClick={() => router.push(`/tree?highlight=${member.id}`)}
                                        >
                                            <TreePine className="w-4 h-4" />
                                            Vị Trí Cây Gia Phả
                                        </Button>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest opacity-50 flex items-center gap-1.5 md:justify-start justify-center">
                                                <Calendar className="w-3 h-3" /> {meta.is_alive === false ? "Sinh thời" : "Ngày sinh"}
                                            </p>
                                            <p className="font-serif text-lg font-bold text-heritage-gold">
                                                {meta.birth_year ? meta.birth_year : "—"}
                                            </p>
                                        </div>
                                        {meta.is_alive === false && (
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest opacity-50 flex items-center gap-1.5 md:justify-start justify-center">
                                                    <MapPin className="w-3 h-3" /> Tạ thế
                                                </p>
                                                <p className="font-serif text-lg font-bold text-heritage-gold">
                                                    {meta.death_year ? meta.death_year : "—"}
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest opacity-50 flex items-center gap-1.5 md:justify-start justify-center">
                                                <Baby className="w-3 h-3" /> Vai vế
                                            </p>
                                            <p className="font-serif text-lg font-bold text-heritage-gold">
                                                Con thứ {member.birth_order ?? 1}
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest opacity-50 flex items-center gap-1.5 md:justify-start justify-center">
                                                <Users className="w-3 h-3" /> Hậu duệ
                                            </p>
                                            <p className="font-serif text-lg font-bold text-heritage-gold">
                                                {children.length} Người
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {meta.notes && (
                                        <div className="mt-8 p-6 bg-heritage-maroon/20 border border-heritage-gold/10 rounded-3xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-all">
                                                <FileText className="w-16 h-16 text-heritage-gold" />
                                            </div>
                                            <p className="text-sm text-heritage-gold-dim leading-relaxed italic font-medium relative z-10 px-4">
                                                "{meta.notes}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Details Grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Parents Card */}
                    <Card className="bg-royal-card border-heritage-gold/10 p-8 rounded-[2rem] royal-glass hover:border-heritage-gold/30 transition-all duration-500 space-y-8">
                        <div className="flex items-center justify-between border-b border-heritage-gold/5 pb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-heritage-gold-dim flex items-center gap-2">
                                <Star className="w-4 h-4 text-heritage-gold" /> Song Thân (Cha Mẹ)
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {father ? (
                                <Link
                                    href={`/people/${father.id}`}
                                    className="flex items-center gap-5 group p-4 -mx-4 rounded-3xl hover:bg-heritage-gold/5 transition-all"
                                >
                                    <div className="w-14 h-14 royal-halo bg-blue-500/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                                        👨
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-serif text-lg font-bold text-heritage-gold truncate group-hover:royal-text-gradient transition-all">
                                            {father.full_name}
                                        </p>
                                        <p className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest mt-1 opacity-60">
                                            Cha · Thế hệ {father.generation_level}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-heritage-gold/20 group-hover:text-heritage-gold group-hover:translate-x-1 transition-all" />
                                </Link>
                            ) : (
                                <div className="p-6 text-center border border-dashed border-heritage-gold/10 rounded-2xl">
                                    <p className="text-xs text-heritage-gold-dim/40 italic font-medium">Chưa rõ thông tin Thân phụ</p>
                                </div>
                            )}

                            {mother ? (
                                <div className="flex items-center gap-5 p-4 -mx-4 rounded-3xl">
                                    <div className="w-14 h-14 royal-halo-pink bg-rose-400/10 flex items-center justify-center shrink-0 shadow-lg">
                                        <Heart className="w-6 h-6 text-rose-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-serif text-lg font-bold text-heritage-gold truncate">
                                            {mother.full_name}
                                        </p>
                                        <p className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest mt-1 opacity-60">
                                            Mẹ · {roleLabel(mother.role_type ?? "")}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center border border-dashed border-heritage-gold/10 rounded-2xl">
                                    <p className="text-xs text-heritage-gold-dim/40 italic font-medium">Chưa rõ thông tin Thân mẫu</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Spouses Card */}
                    <Card className="bg-royal-card border-heritage-gold/10 p-8 rounded-[2rem] royal-glass hover:border-heritage-gold/30 transition-all duration-500 space-y-8">
                        <div className="flex items-center justify-between border-b border-heritage-gold/5 pb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-400 flex items-center gap-2">
                                <Heart className="w-4 h-4" /> Kết Tóc (Phối Ngẫu)
                            </h2>
                            <Badge variant="outline" className="text-[9px] font-bold border-rose-400/20 text-rose-400/60 uppercase px-3">
                                {spouses.length} Người
                            </Badge>
                        </div>

                        {spouses.length > 0 ? (
                            <div className="space-y-4">
                                {spouses.map((sp) => (
                                    <div
                                        key={sp.id}
                                        className="flex items-center gap-5 p-4 -mx-4 rounded-3xl group bg-black/10 hover:bg-rose-400/5 hover:border-rose-400/20 transition-all"
                                    >
                                        <div className="w-14 h-14 royal-halo-pink bg-rose-400/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                                            <span className="text-2xl">💍</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-serif text-lg font-bold text-rose-400 truncate group-hover:text-rose-300 transition-colors">
                                                {sp.full_name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-rose-400/60 uppercase font-black tracking-widest">
                                                    {roleLabel(sp.role_type ?? "")}
                                                </p>
                                                <span className="text-rose-400/20">•</span>
                                                <p className="text-[10px] text-rose-400/40 font-bold italic">
                                                    {sp.status === "married"
                                                        ? "Đang kết hôn"
                                                        : sp.status === "divorced"
                                                            ? "Đã ly hôn"
                                                            : "Đã khuất"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center border border-dashed border-rose-400/10 rounded-2xl flex flex-col items-center gap-4">
                                <Heart className="w-8 h-8 text-rose-400/10" />
                                <p className="text-xs text-rose-400/30 italic font-medium">Chưa ghi nhận thông tin phối ngẫu</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* ── Children ──────────────────────────────────────────── */}
                {children.length > 0 && (
                    <Card className="bg-royal-card border-heritage-gold/10 p-10 rounded-[2.5rem] royal-glass hover:border-heritage-gold/30 transition-all duration-500">
                        <div className="flex items-center justify-between border-b border-heritage-gold/5 pb-6 mb-8">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-2">
                                <Baby className="w-4 h-4" /> Kế Thừa (Con Cái)
                            </h2>
                            <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-4 py-1">
                                {children.length} Người
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {children.map((child) => {
                                const childMeta = (child.metadata as MemberMetadata) || {};
                                return (
                                    <Link
                                        key={child.id}
                                        href={`/people/${child.id}`}
                                        className="group bg-black/30 border border-heritage-gold/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 rounded-[1.8rem] p-5 transition-all duration-500"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl border-2 shrink-0 group-hover:scale-110 shadow-lg transition-all",
                                                    child.gender === "male"
                                                        ? "bg-blue-500/10 border-blue-500/20"
                                                        : "bg-rose-400/10 border-rose-400/20",
                                                )}
                                            >
                                                {child.gender === "male" ? "👦" : "👧"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-serif text-base font-bold text-heritage-gold truncate group-hover:text-emerald-400 transition-colors">
                                                    {child.full_name}
                                                </p>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-heritage-gold-dim/40 mt-1 flex items-center gap-1.5 italic">
                                                    {childMeta.birth_year
                                                        ? `Sinh năm ${childMeta.birth_year}`
                                                        : `Con thứ ${child.birth_order ?? 1}`}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {/* ── Siblings ──────────────────────────────────────────── */}
                {siblings.length > 0 && (
                    <Card className="bg-royal-card border-heritage-gold/5 p-10 rounded-[2.5rem] royal-glass group/siblings">
                        <div className="flex items-center justify-between border-b border-heritage-gold/5 pb-6 mb-8">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-400 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Bào Đệ (Anh Chị Em)
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {siblings.map((s) => (
                                <Link
                                    key={s.id}
                                    href={`/people/${s.id}`}
                                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-heritage-gold/10 bg-black/20 hover:border-heritage-gold/50 hover:bg-heritage-gold/10 transition-all duration-300 text-sm font-medium text-heritage-gold-dim hover:text-heritage-gold group/chip shadow-md"
                                >
                                    <span className="text-base">{s.gender === "male" ? "👦" : "👧"}</span>
                                    <span className="font-serif font-bold group-hover/chip:tracking-wide transition-all">
                                        {s.full_name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
