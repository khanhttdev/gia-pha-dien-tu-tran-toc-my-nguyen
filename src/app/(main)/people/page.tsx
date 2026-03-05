"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAllMembers,
  getAllSpouses,
  createMember,
  updateMember,
  deleteMember,
  createSpouse,
  updateSpouse,
  deleteSpouse,
} from "@/lib/supabase-data";
import {
  Member,
  MemberInsert,
  Spouse,
  SpouseInsert,
  MemberMetadata,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Users,
  Heart,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type MemberFormData = {
  full_name: string;
  gender: "male" | "female";
  birth_year: string;
  death_year: string;
  is_alive: boolean;
  generation_level: string;
  notes: string;
  father_id: string;
  mother_id: string;
  birth_order: string;
  avatar_url: string | null;
};

type SpouseFormData = {
  full_name: string;
  member_id: string;
  role_type: string;
  status: string;
  birth_year: string;
  death_year: string;
};

const EMPTY_MEMBER_FORM: MemberFormData = {
  full_name: "",
  gender: "male",
  birth_year: "",
  death_year: "",
  is_alive: true,
  generation_level: "1",
  notes: "",
  father_id: "",
  mother_id: "",
  birth_order: "1",
  avatar_url: null,
};

const EMPTY_SPOUSE_FORM: SpouseFormData = {
  full_name: "",
  member_id: "",
  role_type: "chinh_that",
  status: "married",
  birth_year: "",
  death_year: "",
};

export default function PeoplePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [spouses, setSpouses] = useState<Spouse[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editSpouse, setEditSpouse] = useState<Spouse | null>(null);
  const [memberForm, setMemberForm] =
    useState<MemberFormData>(EMPTY_MEMBER_FORM);
  const [spouseForm, setSpouseForm] =
    useState<SpouseFormData>(EMPTY_SPOUSE_FORM);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"members" | "spouses">("members");

  const load = useCallback(async () => {
    setLoading(true);
    const [m, s] = await Promise.all([getAllMembers(), getAllSpouses()]);
    setMembers(m);
    setSpouses(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      sb.from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
        .then(({ data: p }) => {
          setIsAdmin((p as any)?.role === "admin");
        });
    });
  }, []);

  const filtered =
    tab === "members"
      ? query.trim()
        ? members.filter((m) =>
          m.full_name.toLowerCase().includes(query.toLowerCase()),
        )
        : members
      : query.trim()
        ? spouses.filter((s) =>
          s.full_name.toLowerCase().includes(query.toLowerCase()),
        )
        : spouses;

  // Member CRUD
  const openAddMember = () => {
    setEditMember(null);
    setMemberForm(EMPTY_MEMBER_FORM);
    setMemberDialogOpen(true);
  };
  const openEditMember = (m: Member) => {
    const meta = (m.metadata as MemberMetadata) || {};
    setEditMember(m);
    setMemberForm({
      full_name: m.full_name,
      gender: m.gender as "male" | "female",
      birth_year: String(meta.birth_year ?? ""),
      death_year: String(meta.death_year ?? ""),
      is_alive: meta.is_alive !== false,
      generation_level: String(m.generation_level),
      notes: meta.notes ?? "",
      father_id: m.father_id ?? "",
      mother_id: m.mother_id ?? "",
      birth_order: String(m.birth_order ?? 1),
      avatar_url: meta.avatar_url ?? null,
    });
    setMemberDialogOpen(true);
  };

  const handleSaveMember = async () => {
    if (!memberForm.full_name.trim()) {
      toast.error("Vui lòng nhập tên");
      return;
    }
    setSaving(true);
    const metadata: MemberMetadata = {
      birth_year: memberForm.birth_year
        ? parseInt(memberForm.birth_year)
        : null,
      death_year: memberForm.death_year
        ? parseInt(memberForm.death_year)
        : null,
      is_alive: memberForm.is_alive,
      avatar_url: memberForm.avatar_url,
      notes: memberForm.notes.trim() || null,
    };
    const payload: MemberInsert = {
      full_name: memberForm.full_name.trim(),
      gender: memberForm.gender,
      generation_level: parseInt(memberForm.generation_level) || 1,
      father_id: memberForm.father_id || null,
      mother_id: memberForm.mother_id || null,
      birth_order: parseInt(memberForm.birth_order) || 1,
      metadata,
    };
    try {
      if (editMember) {
        await updateMember(editMember.id, payload);
        toast.success("Đã cập nhật thông tin");
      } else {
        await createMember(payload);
        toast.success("Đã thêm thành viên mới");
      }
      setMemberDialogOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra");
    }
    setSaving(false);
  };

  const handleDeleteMember = async (m: Member) => {
    if (!confirm(`Xoá "${m.full_name}"? Hành động này không thể hoàn tác.`))
      return;
    try {
      await deleteMember(m.id);
      toast.success("Đã xoá thành viên");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Spouse CRUD
  const openAddSpouse = () => {
    setEditSpouse(null);
    setSpouseForm(EMPTY_SPOUSE_FORM);
    setSpouseDialogOpen(true);
  };
  const openEditSpouse = (s: Spouse) => {
    const meta = (s.metadata as MemberMetadata) || {};
    setEditSpouse(s);
    setSpouseForm({
      full_name: s.full_name,
      member_id: s.member_id,
      role_type: s.role_type ?? "chinh_that",
      status: s.status ?? "married",
      birth_year: String(meta.birth_year ?? ""),
      death_year: String(meta.death_year ?? ""),
    });
    setSpouseDialogOpen(true);
  };

  const handleSaveSpouse = async () => {
    if (!spouseForm.full_name.trim() || !spouseForm.member_id) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setSaving(true);
    const payload: SpouseInsert = {
      full_name: spouseForm.full_name.trim(),
      member_id: spouseForm.member_id,
      role_type: spouseForm.role_type as any,
      status: spouseForm.status as any,
      metadata: {
        birth_year: spouseForm.birth_year
          ? parseInt(spouseForm.birth_year)
          : null,
        death_year: spouseForm.death_year
          ? parseInt(spouseForm.death_year)
          : null,
        is_alive: !spouseForm.death_year,
      },
    };
    try {
      if (editSpouse) {
        await updateSpouse(editSpouse.id, payload);
        toast.success("Đã cập nhật phối ngẫu");
      } else {
        await createSpouse(payload);
        toast.success("Đã thêm phối ngẫu");
      }
      setSpouseDialogOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra");
    }
    setSaving(false);
  };

  const handleDeleteSpouse = async (s: Spouse) => {
    if (!confirm(`Xoá "${s.full_name}"? Hành động này không thể hoàn tác.`))
      return;
    try {
      await deleteSpouse(s.id);
      toast.success("Đã xoá phối ngẫu");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const roleLabel = (r: string) =>
    ({
      chinh_that: "Chính thất",
      ke_that: "Kế thất",
      thu_that: "Thứ thất",
      chong: "Chồng",
    })[r] || r;

  // Group members by generation
  const byGen = (filtered as Member[]).reduce<Record<number, Member[]>>(
    (acc, m) => {
      if (!("generation_level" in m)) return acc;
      const g = (m as Member).generation_level ?? 1;
      (acc[g] = acc[g] || []).push(m as Member);
      return acc;
    },
    {},
  );

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-heritage-gold/10 glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center shadow-xl">
              <Users className="w-5 h-5 text-heritage-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold royal-text-gradient leading-none">Thành Viên</h1>
              <p className="text-xs text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
                {members.length} nội tộc · {spouses.length} phối ngẫu
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="gold-gradient border-0 text-amber-950 font-bold hover:opacity-90 gap-1.5 shadow-lg"
              onClick={tab === "members" ? openAddMember : openAddSpouse}
            >
              <Plus className="w-4 h-4" />{" "}
              {tab === "members" ? "Thêm thành viên" : "Thêm phối ngẫu"}
            </Button>
          )}
        </div>
        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <div className="flex bg-heritage-maroon/40 p-1 rounded-xl border border-heritage-gold/10 self-stretch sm:self-auto">
            <button
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex-1 sm:flex-none",
                tab === "members"
                  ? "bg-heritage-gold text-amber-950 shadow-inner"
                  : "text-heritage-gold-dim hover:text-heritage-gold",
              )}
              onClick={() => setTab("members")}
            >
              Nội tộc
            </button>
            <button
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex-1 sm:flex-none",
                tab === "spouses"
                  ? "bg-rose-500 text-white shadow-inner"
                  : "text-heritage-gold-dim hover:text-heritage-gold",
              )}
              onClick={() => setTab("spouses")}
            >
              Phối ngẫu
            </button>
          </div>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-gold/40" />
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 bg-royal-card border-heritage-gold/20 focus:border-heritage-gold text-heritage-gold placeholder:text-heritage-gold/30 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-heritage-gold" />
          </div>
        ) : tab === "members" ? (
          Object.keys(byGen).length === 0 ? (
            <div className="text-center py-20 border border-dashed border-heritage-gold/20 rounded-3xl bg-royal-card/50">
              <p className="text-heritage-gold-dim italic font-medium">Không tìm thấy thành viên nào</p>
            </div>
          ) : (
            Object.entries(byGen)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([gen, genMembers]) => (
                <div key={gen} className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-heritage-gold/30" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-heritage-gold-dim">
                      Thế hệ {gen}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-heritage-gold/30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {genMembers.map((m) => {
                      const meta = (m.metadata as MemberMetadata) || {};
                      return (
                        <Card
                          key={m.id}
                          className={cn(
                            "group hover:royal-gold-glow",
                            meta.is_alive === false && "opacity-60",
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <Link
                              href={`/people/${m.id}`}
                              className="flex flex-col items-center text-center flex-1 min-w-0"
                            >
                              <div
                                className={cn(
                                  "w-16 h-16 mb-4 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105",
                                  m.gender === "male" ? "royal-halo" : "royal-halo-pink",
                                )}
                              >
                                {meta.avatar_url ? (
                                  <img
                                    src={meta.avatar_url}
                                    alt={m.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl bg-heritage-maroon/20">
                                    {m.gender === "male" ? "♂" : "♀"}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <p className="font-serif text-lg font-bold royal-text-gradient truncate px-4">
                                  {m.full_name}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-heritage-gold-dim/70">
                                  Chi Họ Trần · Đời {m.generation_level}
                                </p>
                                {(meta.birth_year || meta.death_year) && (
                                  <p className="text-[11px] font-mono text-heritage-gold/60 mt-2 bg-heritage-gold/5 inline-block px-2 py-0.5 rounded-full border border-heritage-gold/10">
                                    {[meta.birth_year, meta.death_year]
                                      .filter(Boolean)
                                      .join(" – ")}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </div>

                          {/* Quick Actions at bottom of card */}
                          <div className="flex items-center justify-center gap-1 mt-4 pt-4 border-t border-heritage-gold/5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 relative z-10">
                            <Button
                              aria-label="Xem hồ sơ"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 hover:bg-heritage-gold/10 text-heritage-gold/60 hover:text-heritage-gold rounded-full"
                              asChild
                            >
                              <Link href={`/people/${m.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  aria-label="Edit member"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 hover:bg-heritage-gold/10 text-heritage-gold/60 hover:text-heritage-gold rounded-full"
                                  onClick={() => openEditMember(m)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  aria-label="Delete member"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-full"
                                  onClick={() => handleDeleteMember(m)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>

                          {meta.is_alive === false && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none rotate-12">
                              <span className="text-4xl">🕯️</span>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
          )
        ) : (filtered as Spouse[]).length === 0 ? (
          <div className="text-center py-20 border border-dashed border-heritage-gold/20 rounded-3xl bg-royal-card/50">
            <p className="text-heritage-gold-dim italic font-medium">Không tìm thấy phối ngẫu nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filtered as Spouse[]).map((s) => {
              const linkedMember = members.find((m) => m.id === s.member_id);

              return (
                <Card
                  key={s.id}
                  className="group hover:royal-gold-glow border-rose-500/20 hover:border-rose-500/40"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 royal-halo-pink bg-rose-500/10 flex items-center justify-center shadow-xl">
                      <Heart className="w-8 h-8 text-rose-400 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="space-y-1 w-full">
                      <p className="font-serif text-lg font-bold text-rose-200 group-hover:text-rose-100 transition-colors px-4">
                        {s.full_name}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400/70">
                        {roleLabel(s.role_type ?? "")}
                      </p>
                      {linkedMember && (
                        <div className="mt-3 pt-3 border-t border-rose-500/5">
                          <p className="text-[11px] text-heritage-gold-dim italic">
                            Phu nhân/Phu quân của
                          </p>
                          <p className="text-xs font-bold text-heritage-gold group-hover:text-heritage-gold-dim transition-colors">
                            💍 {linkedMember.full_name}
                          </p>
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-heritage-gold/5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 w-full relative z-10">
                        <Button
                          aria-label="Edit spouse"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 hover:bg-heritage-gold/10 text-heritage-gold/60 hover:text-heritage-gold rounded-full"
                          onClick={() => openEditSpouse(s)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          aria-label="Delete spouse"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-full"
                          onClick={() => handleDeleteSpouse(s)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Add/Edit Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-md bg-royal-card border-heritage-gold/30">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl royal-text-gradient">
              {editMember ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 custom-scrollbar max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Họ và tên *</Label>
              <Input
                value={memberForm.full_name}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, full_name: e.target.value }))
                }
                placeholder="Trần Văn A"
                className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Ảnh đại diện</Label>
              <ImageUpload
                bucket="avatars"
                value={memberForm.avatar_url}
                onChange={(url) =>
                  setMemberForm((f) => ({ ...f, avatar_url: url }))
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Giới tính</Label>
                <select
                  value={memberForm.gender}
                  onChange={(e) =>
                    setMemberForm((f) => ({
                      ...f,
                      gender: e.target.value as any,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-heritage-gold/20 bg-black/20 text-heritage-gold text-sm outline-none focus:border-heritage-gold/50"
                >
                  <option value="male" className="bg-royal-maroon-dark">Nam</option>
                  <option value="female" className="bg-royal-maroon-dark">Nữ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Thế hệ</Label>
                <Input
                  type="number"
                  min="1"
                  value={memberForm.generation_level}
                  onChange={(e) =>
                    setMemberForm((f) => ({
                      ...f,
                      generation_level: e.target.value,
                    }))
                  }
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Thứ tự sinh</Label>
                <Input
                  type="number"
                  min="1"
                  value={memberForm.birth_order}
                  onChange={(e) =>
                    setMemberForm((f) => ({
                      ...f,
                      birth_order: e.target.value,
                    }))
                  }
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Cha (father_id)</Label>
                <select
                  value={memberForm.father_id}
                  onChange={(e) =>
                    setMemberForm((f) => ({ ...f, father_id: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-heritage-gold/20 bg-black/20 text-heritage-gold text-sm outline-none focus:border-heritage-gold/50"
                >
                  <option value="" className="bg-royal-maroon-dark">— Không —</option>
                  {members
                    .filter((m) => m.gender === "male")
                    .map((m) => (
                      <option key={m.id} value={m.id} className="bg-royal-maroon-dark">
                        {m.full_name} (Đời {m.generation_level})
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Mẹ (mother_id)</Label>
                <select
                  value={memberForm.mother_id}
                  onChange={(e) =>
                    setMemberForm((f) => ({ ...f, mother_id: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-heritage-gold/20 bg-black/20 text-heritage-gold text-sm outline-none focus:border-heritage-gold/50"
                >
                  <option value="" className="bg-royal-maroon-dark">— Không —</option>
                  {spouses.map((s) => (
                    <option key={s.id} value={s.id} className="bg-royal-maroon-dark">
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Năm sinh</Label>
                <Input
                  type="number"
                  placeholder="1950"
                  value={memberForm.birth_year}
                  onChange={(e) =>
                    setMemberForm((f) => ({ ...f, birth_year: e.target.value }))
                  }
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Năm mất</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={memberForm.death_year}
                  onChange={(e) =>
                    setMemberForm((f) => ({
                      ...f,
                      death_year: e.target.value,
                      is_alive: !e.target.value,
                    }))
                  }
                  className="bg-black/20 border-heritage-gold/20 text-heritage-gold"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-heritage-gold/10">
              <input
                type="checkbox"
                id="alive"
                checked={memberForm.is_alive}
                onChange={(e) =>
                  setMemberForm((f) => ({
                    ...f,
                    is_alive: e.target.checked,
                    death_year: e.target.checked ? "" : f.death_year,
                  }))
                }
                className="w-4 h-4 rounded border-heritage-gold/30 bg-black/20 text-heritage-gold accent-heritage-gold"
              />
              <Label htmlFor="alive" className="cursor-pointer text-heritage-gold hover:text-heritage-gold-dim transition-colors text-sm font-medium">
                Còn sống
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-heritage-gold-dim text-xs font-bold uppercase tracking-wider">Ghi chú</Label>
              <textarea
                value={memberForm.notes}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Thông tin thêm về tiểu sử..."
                className="w-full min-h-[100px] p-3 rounded-lg border border-heritage-gold/20 bg-black/20 text-heritage-gold text-sm outline-none focus:border-heritage-gold/50 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-heritage-gold/10">
            <Button
              variant="ghost"
              className="text-heritage-gold hover:bg-heritage-gold/10 font-bold"
              onClick={() => setMemberDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="gold-gradient border-0 text-amber-950 font-bold shadow-lg"
              onClick={handleSaveMember}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editMember ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spouse Add/Edit Dialog */}
      <Dialog open={spouseDialogOpen} onOpenChange={setSpouseDialogOpen}>
        <DialogContent className="max-w-md bg-royal-card border-heritage-gold/30">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-rose-200">
              {editSpouse ? "Chỉnh sửa phối ngẫu" : "Thêm phối ngẫu mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-rose-400 text-xs font-bold uppercase tracking-wider">Họ và tên *</Label>
              <Input
                value={spouseForm.full_name}
                onChange={(e) =>
                  setSpouseForm((f) => ({ ...f, full_name: e.target.value }))
                }
                placeholder="Nguyễn Thị B"
                className="bg-black/20 border-rose-500/20 text-rose-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-400 text-xs font-bold uppercase tracking-wider">Thành viên kết hôn *</Label>
              <select
                value={spouseForm.member_id}
                onChange={(e) =>
                  setSpouseForm((f) => ({ ...f, member_id: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-lg border border-rose-500/20 bg-black/20 text-rose-100 text-sm outline-none focus:border-rose-400/50"
              >
                <option value="" className="bg-royal-maroon-dark">— Chọn —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-royal-maroon-dark">
                    {m.full_name} (Đời {m.generation_level})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-rose-400 text-xs font-bold uppercase tracking-wider">Vai trò</Label>
                <select
                  value={spouseForm.role_type}
                  onChange={(e) =>
                    setSpouseForm((f) => ({ ...f, role_type: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-rose-500/20 bg-black/20 text-rose-100 text-sm outline-none"
                >
                  <option value="chinh_that" className="bg-royal-maroon-dark">Chính thất</option>
                  <option value="ke_that" className="bg-royal-maroon-dark">Kế thất</option>
                  <option value="thu_that" className="bg-royal-maroon-dark">Thứ thất</option>
                  <option value="chong" className="bg-royal-maroon-dark">Chồng</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-rose-400 text-xs font-bold uppercase tracking-wider">Trình trạng</Label>
                <select
                  value={spouseForm.status}
                  onChange={(e) =>
                    setSpouseForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-rose-500/20 bg-black/20 text-rose-100 text-sm outline-none"
                >
                  <option value="married" className="bg-royal-maroon-dark">Đang kết hôn</option>
                  <option value="divorced" className="bg-royal-maroon-dark">Ly hôn</option>
                  <option value="widowed" className="bg-royal-maroon-dark">Góa</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-rose-500/10">
            <Button
              variant="ghost"
              className="text-rose-400 hover:bg-rose-500/10 font-bold"
              onClick={() => setSpouseDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-lg"
              onClick={handleSaveSpouse}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
