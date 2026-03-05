"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Check,
  X,
  Loader2,
  UserCheck,
  RefreshCw,
  ClipboardList,
  Plus,
  Trash2,
  BarChart3,
  Wallet,
  MessageSquare,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  adminCreateUser,
  deleteUser,
  setUserRole,
  setUserStatus,
} from "@/lib/admin-actions";
import { cn } from "@/lib/utils";
import { Profile as UserProfile, Contribution, ActivityLog } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { APP_ROLES, APP_STATUS, APP_PATHS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Import New Subcomponents
import { AnalyticsTab } from "@/components/admin/analytics-tab";
import { FundManagerTab } from "@/components/admin/fund-manager-tab";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAdmin, currentUserId } = useAuth();

  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<typeof APP_ROLES[keyof typeof APP_ROLES]>(
    APP_ROLES.MEMBER,
  );
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const sb = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: users }, { data: contribs }, { data: history }] =
        await Promise.all([
          sb
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false }),
          sb
            .from("contributions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20),
          sb
            .from("activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);
      setProfiles(users ?? []);
      setContributions(contribs ?? []);
      setLogs(history ?? []);
    } catch (e: any) {
      toast.error("Lỗi khi tải dữ liệu: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [sb]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  // Delete modal hook
  const {
    open: deleteConfirmOpen,
    setOpen: setDeleteConfirmOpen,
    data: deleteModalData,
    loading: isDeleting,
    showConfirm: showDeleteConfirm,
    handleConfirm: confirmDeleteUser,
  } = useConfirmModal<{ id: string; name: string }>({
    onConfirm: async (data) => {
      setProfiles((prev) => prev.filter((p) => p.id !== data.id));
      return deleteUser(data.id);
    },
    onSuccess: () => loadData(),
    successMessage: "Đã xóa người dùng thành công",
  });

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    action: typeof APP_STATUS.APPROVED | typeof APP_STATUS.REJECTED;
  }>({ open: false, userId: "", userName: "", action: APP_STATUS.APPROVED });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const updateRole = async (
    userId: string,
    role: typeof APP_ROLES[keyof typeof APP_ROLES],
  ) => {
    try {
      const res = await setUserRole(userId, role);
      if (res.error) throw new Error(res.error);
      toast.success(
        `Đã đổi vai trò thành ${role === APP_ROLES.ADMIN ? "Admin" : role === APP_ROLES.ACCOUNTANT ? "Thủ quỹ" : "Thành viên"}`,
      );
      await loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword)
      return toast.error("Vui lòng nhập email và mật khẩu");
    setIsCreatingUser(true);
    const formData = new FormData();
    formData.append("email", newEmail);
    formData.append("password", newPassword);
    formData.append("role", newRole);

    const res = await adminCreateUser(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Đã tạo người dùng thành công");
      setShowAddUser(false);
      setNewEmail("");
      setNewPassword("");
      setNewRole(APP_ROLES.MEMBER);
      await loadData();
    }
    setIsCreatingUser(false);
  };

  const confirmStatusChange = async () => {
    setIsUpdatingStatus(true);
    const res = await setUserStatus(statusModal.userId, statusModal.action);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(
        statusModal.action === APP_STATUS.APPROVED
          ? "Đã duyệt thành viên"
          : "Đã từ chối thành viên",
      );
      await loadData();
    }
    setIsUpdatingStatus(false);
    setStatusModal((prev) => ({ ...prev, open: false }));
  };

  const updateContrib = async (id: string, status: typeof APP_STATUS.APPROVED | typeof APP_STATUS.REJECTED) => {
    try {
      await sb
        .from("contributions")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      toast.success(status === APP_STATUS.APPROVED ? "Đã duyệt" : "Đã từ chối");
      await loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (role === APP_ROLES.ADMIN)
      return (
        <Badge className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-heritage-gold border-heritage-gold/30">
          👑 Admin
        </Badge>
      );
    if (role === APP_ROLES.ACCOUNTANT)
      return (
        <Badge className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          💰 Thủ quỹ
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider border-heritage-gold/20 text-heritage-gold/60">
        👁 Thành viên
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (status === APP_STATUS.APPROVED)
      return (
        <Badge className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          ✅ Đã duyệt
        </Badge>
      );
    if (status === APP_STATUS.REJECTED)
      return (
        <Badge className="text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border-red-500/20">
          ❌ Từ chối
        </Badge>
      );
    return (
      <Badge className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-heritage-gold border-heritage-gold/20 animate-pulse">
        ⏳ Chờ duyệt
      </Badge>
    );
  };

  const pendingCount = profiles.filter((p) => p.status === APP_STATUS.PENDING).length;

  if (!isAdmin && !loading) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-12 bg-royal-card border border-heritage-gold/20 rounded-[3rem] royal-glass space-y-6">
          <Shield className="w-16 h-16 text-heritage-gold/30 mx-auto" />
          <h2 className="text-2xl font-serif font-bold royal-text-gradient">Truy cập bị giới hạn</h2>
          <p className="text-sm text-heritage-gold-dim italic font-medium">
            Chỉ Quản trị viên cao cấp mới có quyền truy cập vào trung tâm điều hành dòng tộc.
          </p>
          <Button className="gold-gradient text-amber-950 font-bold px-8 rounded-xl" onClick={() => window.location.href = APP_PATHS.HOME}>
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-heritage-gold/10 glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 royal-halo bg-heritage-gold/10 flex items-center justify-center shadow-xl">
              <Shield className="w-5 h-5 text-heritage-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold royal-text-gradient leading-none">Trung Tâm Điều Hành</h1>
              <p className="text-xs text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
                Quản trị hệ thống, phê duyệt thành viên và theo dõi hoạt động dòng họ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Badge
                variant="destructive"
                className="text-[10px] font-bold uppercase tracking-widest bg-red-600 animate-pulse gap-1.5 px-3 py-1 shadow-lg"
              >
                <Clock className="w-3 h-3" /> {pendingCount} yêu cầu duyệt
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 text-xs font-bold uppercase tracking-widest border-heritage-gold/20 text-heritage-gold hover:bg-heritage-gold/10 transition-all"
              onClick={loadData}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />{" "}
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full px-6 py-10 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-heritage-gold" />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full max-w-6xl mx-auto flex flex-col items-center"
          >
            <TabsList className="mb-10 bg-heritage-maroon/40 p-1.5 rounded-full border border-heritage-gold/10 shadow-xl inline-flex">
              <TabsTrigger value="analytics" className="rounded-full px-6 py-2.5 data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-widest transition-all duration-300 gap-2">
                <BarChart3 className="w-4 h-4" /> Thống Kê
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-full px-6 py-2.5 data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-widest transition-all duration-300 gap-2 relative">
                <Users className="w-4 h-4" /> Thành Viên
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse border-2 border-heritage-maroon">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="funds" className="rounded-full px-6 py-2.5 data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-widest transition-all duration-300 gap-2">
                <Wallet className="w-4 h-4" /> Quỹ Họ
              </TabsTrigger>
              <TabsTrigger value="contributions" className="rounded-full px-6 py-2.5 data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-widest transition-all duration-300 gap-2 relative">
                <MessageSquare className="w-4 h-4" /> Đề Xuất
                {contributions.filter((c) => c.status === APP_STATUS.PENDING).length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse border border-heritage-maroon" />
                )}
              </TabsTrigger>
              <TabsTrigger value="logs" className="rounded-full px-6 py-2.5 data-[state=active]:bg-heritage-gold data-[state=active]:text-amber-950 text-xs font-bold uppercase tracking-widest transition-all duration-300 gap-2">
                <ClipboardList className="w-4 h-4" /> Nhật Ký
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="w-full mt-0 outline-none animate-in fade-in duration-700">
              <AnalyticsTab />
            </TabsContent>

            <TabsContent value="funds" className="w-full mt-0 outline-none animate-in fade-in duration-700">
              <FundManagerTab />
            </TabsContent>

            <TabsContent value="users" className="w-full mt-0 outline-none animate-in fade-in duration-700 space-y-10">
              {pendingCount > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Yêu cầu thành viên mới ({pendingCount})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profiles
                      .filter((p) => p.status === APP_STATUS.PENDING)
                      .map((p) => (
                        <Card key={p.id} className="p-5 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 royal-halo bg-heritage-gold/20 flex items-center justify-center text-lg font-serif font-bold text-heritage-gold shrink-0 shadow-lg">
                                {p.full_name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-serif text-base font-bold text-heritage-gold truncate">
                                  {p.full_name ?? "Chưa đặt tên"}
                                </p>
                                <p className="text-[10px] text-heritage-gold-dim font-mono opacity-60 truncate">
                                  {p.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                              <Button
                                size="sm"
                                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg"
                                onClick={() =>
                                  setStatusModal({
                                    open: true,
                                    userId: p.id,
                                    userName: p.full_name ?? p.email ?? "",
                                    action: APP_STATUS.APPROVED,
                                  })
                                }
                              >
                                <ShieldCheck className="w-4 h-4" /> Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-4 border-red-500/40 text-red-500 hover:bg-red-500/10 font-bold gap-2"
                                onClick={() =>
                                  setStatusModal({
                                    open: true,
                                    userId: p.id,
                                    userName: p.full_name ?? p.email ?? "",
                                    action: APP_STATUS.REJECTED,
                                  })
                                }
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </section>
              )}

              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-heritage-gold" />
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-heritage-gold-dim">Thành viên hệ thống ({profiles.length})</h3>
                  </div>
                  <Button
                    size="sm"
                    className="h-9 px-6 gold-gradient border-0 text-amber-950 font-bold gap-2 shadow-lg"
                    onClick={() => setShowAddUser(!showAddUser)}
                  >
                    <Plus className="w-4 h-4" /> Thêm thành viên
                  </Button>
                </div>

                {showAddUser && (
                  <Card className="p-8 border-heritage-gold/20 bg-royal-card animate-in slide-in-from-top-4 duration-500 hover:royal-gold-glow">
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px_120px] gap-6 items-end">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Email Tài Khoản</Label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          required
                          className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl px-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm transition-all"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Mật Khẩu</Label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl px-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm transition-all"
                          placeholder="******"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-heritage-gold-dim uppercase font-bold tracking-widest px-1">Vai Trò</Label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as any)}
                          className="w-full h-11 bg-black/40 border border-heritage-gold/20 rounded-xl px-4 text-heritage-gold focus:border-heritage-gold/50 outline-none text-sm appearance-none cursor-pointer"
                        >
                          <option value={APP_ROLES.MEMBER} className="bg-royal-maroon-dark">Thành viên</option>
                          <option value={APP_ROLES.ACCOUNTANT} className="bg-royal-maroon-dark">Thủ quỹ</option>
                          <option value={APP_ROLES.ADMIN} className="bg-royal-maroon-dark">Admin</option>
                        </select>
                      </div>
                      <Button
                        type="submit"
                        disabled={isCreatingUser}
                        className="h-11 bg-heritage-gold hover:bg-heritage-gold/90 text-amber-950 font-bold rounded-xl shadow-xl disabled:opacity-50"
                      >
                        {isCreatingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : "Thêm Ngay"}
                      </Button>
                    </form>
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {profiles
                    .filter((p) => p.status !== APP_STATUS.PENDING)
                    .map((p) => (
                      <div
                        key={p.id}
                        className={cn(
                          "group bg-royal-card/40 hover:bg-royal-card/80 border border-heritage-gold/10 hover:border-heritage-gold/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 transition-all duration-300",
                          p.id === currentUserId && "ring-2 ring-heritage-gold/20 bg-heritage-gold/5",
                        )}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 royal-halo bg-heritage-maroon/20 flex items-center justify-center text-lg font-serif font-bold text-heritage-gold shrink-0 group-hover:scale-105 transition-transform">
                            {p.full_name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-serif text-base font-bold text-heritage-gold group-hover:tracking-wide transition-all truncate">
                                {p.full_name ?? "Chưa đặt tên"}
                              </p>
                              {p.id === currentUserId && (
                                <Badge className="bg-heritage-gold text-amber-950 text-[9px] font-bold uppercase tracking-tighter shadow-lg">Bạn</Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-heritage-gold-dim font-mono opacity-50 truncate">{p.email}</p>
                            <p className="text-[9px] text-heritage-gold-dim/40 font-bold uppercase tracking-widest mt-0.5">Tham gia: {p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : "N/A"}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                          {getRoleBadge(p.role)}
                          {getStatusBadge(p.status)}

                          {p.id !== currentUserId && (
                            <div className="flex items-center gap-1.5 ml-2 border-l border-heritage-gold/10 pl-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-heritage-gold/60 hover:text-heritage-gold hover:bg-heritage-gold/10 px-3">
                                    Cấp quyền ▾
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-royal-card border-heritage-gold/20 shadow-2xl">
                                  <DropdownMenuItem onClick={() => updateRole(p.id, APP_ROLES.MEMBER)} className="gap-2 font-bold text-xs hover:bg-heritage-gold/10 text-heritage-gold/80">
                                    <UserCheck className="w-4 h-4" /> Thành viên
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateRole(p.id, APP_ROLES.ACCOUNTANT)} className="gap-2 font-bold text-xs hover:bg-emerald-500/10 text-emerald-400">
                                    <Wallet className="w-4 h-4" /> Thủ quỹ
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateRole(p.id, APP_ROLES.ADMIN)} className="gap-2 font-bold text-xs hover:bg-amber-500/10 text-heritage-gold">
                                    <Shield className="w-4 h-4" /> Admin
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                onClick={() => showDeleteConfirm({ id: p.id, name: p.full_name ?? p.email ?? "" })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="logs" className="w-full mt-0 outline-none animate-in fade-in duration-700 space-y-6">
              <div className="flex items-center gap-2 px-2">
                <ClipboardList className="w-5 h-5 text-heritage-gold" />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-heritage-gold-dim">Nhật ký hoạt động gần đây</h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {logs.map((log) => (
                  <Card
                    key={log.id}
                    className="p-4 border-heritage-gold/5 bg-heritage-maroon/10 hover:bg-heritage-maroon/20 hover:border-heritage-gold/20 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 royal-halo bg-heritage-gold/5 flex items-center justify-center text-heritage-gold/40 shrink-0">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md",
                            log.action === "INSERT" ? "bg-emerald-500/10 text-emerald-500" :
                              log.action === "UPDATE" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {log.action === "INSERT" ? "Khởi tạo" : log.action === "UPDATE" ? "Cập nhật" : "Gỡ bỏ"}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-heritage-gold/30">
                            <Clock className="w-3 h-3" />
                            {new Date(log.created_at).toLocaleString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit"
                            })}
                          </div>
                        </div>
                        <p className="text-sm font-serif font-medium text-heritage-gold/90 leading-relaxed">
                          Bản ghi <span className="text-heritage-gold font-bold">{log.table_name}</span> đã được {log.action === "INSERT" ? "thêm mới" : "thay đổi"}.
                        </p>
                        <div className="text-[10px] text-heritage-gold/40 truncate italic opacity-60">ID bản ghi: {log.record_id}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contributions" className="w-full mt-0 outline-none animate-in fade-in duration-700 space-y-6">
              <div className="flex items-center gap-2 px-2">
                <MessageSquare className="w-5 h-5 text-heritage-gold" />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-heritage-gold-dim">Phê duyệt đề xuất Đóng góp</h2>
              </div>
              {/* Contribution list integration - could be a separate component if it grows */}
              <div className="text-center py-20 bg-royal-card/20 border border-dashed border-heritage-gold/10 rounded-[3rem]">
                <MessageSquare className="w-12 h-12 text-heritage-gold/10 mx-auto mb-4" />
                <p className="text-heritage-gold-dim italic font-medium">Mô-đun đang được đồng bộ hóa với hệ thống Royal Gold</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        open={statusModal.open}
        onOpenChange={(open) => setStatusModal((prev) => ({ ...prev, open }))}
        title={statusModal.action === APP_STATUS.APPROVED ? "Phê duyệt thành viên" : "Từ chối thành viên"}
        description={`Bạn có chắc chắn muốn ${statusModal.action === APP_STATUS.APPROVED ? "CHẤP THUẬN" : "TỪ CHỐI"} "${statusModal.userName}" gia nhập dòng họ?`}
        confirmText={statusModal.action === APP_STATUS.APPROVED ? "Xác nhận Duyệt" : "Lưu Từ chối"}
        variant={statusModal.action === APP_STATUS.APPROVED ? "success" : "destructive"}
        loading={isUpdatingStatus}
        onConfirm={confirmStatusChange}
      />

      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xóa vĩnh viễn tài khoản"
        description={`Hành động này sẽ xóa sạch dữ liệu của "${deleteModalData?.name}". Hành động KHÔNG THỂ HOÀN TÁC. Bạn có chắc chắn?`}
        variant="destructive"
        confirmText="Xóa Vĩnh Viễn"
        loading={isDeleting}
        onConfirm={confirmDeleteUser}
      />
    </div>
  );
}
