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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-border glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-900" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">Thành Viên</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {members.length} nội tộc · {spouses.length} phối ngẫu
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="gold-gradient border-0 text-amber-950 font-semibold hover:opacity-90 gap-1.5"
              onClick={tab === "members" ? openAddMember : openAddSpouse}
            >
              <Plus className="w-3.5 h-3.5" />{" "}
              {tab === "members" ? "Thêm thành viên" : "Thêm phối ngẫu"}
            </Button>
          )}
        </div>
        {/* Tabs + Search */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex gap-1">
            <button
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                tab === "members"
                  ? "bg-amber-500/20 text-amber-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setTab("members")}
            >
              Nội tộc ({members.length})
            </button>
            <button
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                tab === "spouses"
                  ? "bg-rose-400/20 text-rose-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setTab("spouses")}
            >
              Phối ngẫu ({spouses.length})
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : tab === "members" ? (
          Object.keys(byGen).length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Không tìm thấy thành viên nào
            </p>
          ) : (
            Object.entries(byGen)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([gen, genMembers]) => (
                <div key={gen}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground px-2">
                      Thế hệ {gen}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {genMembers.map((m) => {
                      const meta = (m.metadata as MemberMetadata) || {};
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "glass rounded-xl p-4 border border-border/60 hover:border-amber-400/40 transition-all duration-200 group",
                            meta.is_alive === false && "opacity-60",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/people/${m.id}`}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border overflow-hidden",
                                  m.gender === "male"
                                    ? "bg-blue-500/10 border-blue-500/30"
                                    : "bg-rose-400/10 border-rose-400/30",
                                )}
                              >
                                {meta.avatar_url ? (
                                  <img
                                    src={meta.avatar_url}
                                    alt={m.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : m.gender === "male" ? (
                                  "👨"
                                ) : (
                                  "👩"
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate group-hover:text-amber-500 transition-colors">
                                  {m.full_name}
                                </p>
                                <p
                                  className={cn(
                                    "text-xs",
                                    m.gender === "male"
                                      ? "text-blue-500"
                                      : "text-rose-400",
                                  )}
                                >
                                  {m.gender === "male" ? "♂ Nam" : "♀ Nữ"}
                                </p>
                                {(meta.birth_year || meta.death_year) && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {[meta.birth_year, meta.death_year]
                                      .filter(Boolean)
                                      .join(" – ")}
                                  </p>
                                )}
                              </div>
                            </Link>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                aria-label="Xem hồ sơ"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-amber-500"
                                asChild
                              >
                                <Link href={`/people/${m.id}`}>
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                              </Button>
                              {isAdmin && (
                                <>
                                  <Button
                                    aria-label="Edit member"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:text-amber-500"
                                    onClick={() => openEditMember(m)}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    aria-label="Delete member"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:text-red-500"
                                    onClick={() => handleDeleteMember(m)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {meta.is_alive === false && (
                            <Badge
                              variant="secondary"
                              className="mt-2 text-[10px]"
                            >
                              Đã mất
                            </Badge>
                          )}
                          {meta.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">
                              {meta.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          )
        ) : (filtered as Spouse[]).length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Không tìm thấy phối ngẫu nào
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(filtered as Spouse[]).map((s) => {
              const linkedMember = members.find((m) => m.id === s.member_id);

              return (
                <div
                  key={s.id}
                  className="glass rounded-xl p-4 border border-border/60 hover:border-rose-400/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border bg-rose-400/10 border-rose-400/30">
                        <Heart className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {s.full_name}
                        </p>
                        <p className="text-xs text-rose-400">
                          {roleLabel(s.role_type ?? "")}
                        </p>
                        {linkedMember && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            💍 {linkedMember.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          aria-label="Edit spouse"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-amber-500"
                          onClick={() => openEditSpouse(s)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          aria-label="Delete spouse"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-red-500"
                          onClick={() => handleDeleteSpouse(s)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Add/Edit Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMember ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Họ và tên *</Label>
              <Input
                value={memberForm.full_name}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, full_name: e.target.value }))
                }
                placeholder="Trần Văn A"
              />
            </div>
            <div className="space-y-1">
              <Label>Ảnh đại diện</Label>
              <ImageUpload
                bucket="avatars"
                value={memberForm.avatar_url}
                onChange={(url) =>
                  setMemberForm((f) => ({ ...f, avatar_url: url }))
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Giới tính</Label>
                <select
                  value={memberForm.gender}
                  onChange={(e) =>
                    setMemberForm((f) => ({
                      ...f,
                      gender: e.target.value as any,
                    }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Thế hệ</Label>
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
                />
              </div>
              <div className="space-y-1">
                <Label>Thứ tự sinh</Label>
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
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Cha (father_id)</Label>
                <select
                  value={memberForm.father_id}
                  onChange={(e) =>
                    setMemberForm((f) => ({ ...f, father_id: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">— Không —</option>
                  {members
                    .filter((m) => m.gender === "male")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} (F{m.generation_level})
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Mẹ (mother_id)</Label>
                <select
                  value={memberForm.mother_id}
                  onChange={(e) =>
                    setMemberForm((f) => ({ ...f, mother_id: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">— Không —</option>
                  {spouses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Năm sinh</Label>
                <Input
                  type="number"
                  placeholder="1950"
                  value={memberForm.birth_year}
                  onChange={(e) =>
                    setMemberForm((f) => ({ ...f, birth_year: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Năm mất</Label>
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
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                className="rounded"
              />
              <Label htmlFor="alive" className="cursor-pointer">
                Còn sống
              </Label>
            </div>
            <div className="space-y-1">
              <Label>Ghi chú</Label>
              <Input
                value={memberForm.notes}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Thông tin thêm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMemberDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="gold-gradient border-0 text-amber-950"
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editSpouse ? "Chỉnh sửa phối ngẫu" : "Thêm phối ngẫu mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Họ và tên *</Label>
              <Input
                value={spouseForm.full_name}
                onChange={(e) =>
                  setSpouseForm((f) => ({ ...f, full_name: e.target.value }))
                }
                placeholder="Nguyễn Thị B"
              />
            </div>
            <div className="space-y-1">
              <Label>Thành viên kết hôn *</Label>
              <select
                value={spouseForm.member_id}
                onChange={(e) =>
                  setSpouseForm((f) => ({ ...f, member_id: e.target.value }))
                }
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">— Chọn —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} (F{m.generation_level})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Vai vế</Label>
                <select
                  value={spouseForm.role_type}
                  onChange={(e) =>
                    setSpouseForm((f) => ({ ...f, role_type: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="chinh_that">Chính thất</option>
                  <option value="ke_that">Kế thất</option>
                  <option value="thu_that">Thứ thất</option>
                  <option value="chong">Chồng</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Tình trạng</Label>
                <select
                  value={spouseForm.status}
                  onChange={(e) =>
                    setSpouseForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="married">Đang kết hôn</option>
                  <option value="divorced">Đã ly hôn</option>
                  <option value="deceased">Đã mất</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Năm sinh</Label>
                <Input
                  type="number"
                  placeholder="1950"
                  value={spouseForm.birth_year}
                  onChange={(e) =>
                    setSpouseForm((f) => ({ ...f, birth_year: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Năm mất</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={spouseForm.death_year}
                  onChange={(e) =>
                    setSpouseForm((f) => ({ ...f, death_year: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSpouseDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="gold-gradient border-0 text-amber-950"
              onClick={handleSaveSpouse}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editSpouse ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
