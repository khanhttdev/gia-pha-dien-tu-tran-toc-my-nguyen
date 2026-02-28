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
      // Optimistic UI
      setProfiles((prev) => prev.filter((p) => p.id !== data.id));
      return deleteUser(data.id);
    },
    onSuccess: () => loadData(),
    successMessage: "Đã xóa người dùng thành công",
  });

  // Status modal state handled manually for custom logic
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
        <Badge className="text-[10px] bg-amber-500/20 text-amber-600 border-amber-500/30">
          👑 Admin
        </Badge>
      );
    if (role === APP_ROLES.ACCOUNTANT)
      return (
        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
          💰 Thủ quỹ
        </Badge>
      );
    return (
      <Badge variant="secondary" className="text-[10px]">
        👁 Thành viên
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (status === APP_STATUS.APPROVED)
      return (
        <Badge className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          ✅ Đã duyệt
        </Badge>
      );
    if (status === APP_STATUS.REJECTED)
      return (
        <Badge className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
          ❌ Từ chối
        </Badge>
      );
    return (
      <Badge className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">
        ⏳ Chờ duyệt
      </Badge>
    );
  };

  const pendingCount = profiles.filter((p) => p.status === APP_STATUS.PENDING).length;

  if (!isAdmin && !loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl">🔒</div>
          <h2 className="text-lg font-bold">Không có quyền truy cập</h2>
          <p className="text-sm text-muted-foreground">
            Chỉ Admin mới có thể xem trang này
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 border-b border-border glass z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-900" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">Admin Panel</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quản lý Gia phả & Dòng họ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Badge
                variant="destructive"
                className="text-xs animate-pulse gap-1"
              >
                <Clock className="w-3 h-3" /> {pendingCount} chờ duyệt
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs bg-background/50 backdrop-blur-sm"
              onClick={loadData}
            >
              <RefreshCw className="w-3 h-3" />{" "}
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full max-w-5xl mx-auto"
          >
            <div className="mb-6 border-b border-border/40 pb-2">
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between gap-2 border-amber-500/30 glass"
                    >
                      <span className="flex items-center gap-2">
                        {activeTab === "analytics" && (
                          <>
                            <BarChart3 className="w-4 h-4 text-amber-500" /> Thống Kê
                          </>
                        )}
                        {activeTab === "users" && (
                          <>
                            <Users className="w-4 h-4 text-amber-500" /> Người Dùng
                          </>
                        )}
                        {activeTab === "funds" && (
                          <>
                            <Wallet className="w-4 h-4 text-emerald-500" /> Quỹ Họ
                          </>
                        )}
                        {activeTab === "contributions" && (
                          <>
                            <MessageSquare className="w-4 h-4 text-amber-500" /> Đề Xuất
                          </>
                        )}
                        {activeTab === "logs" && (
                          <>
                            <ClipboardList className="w-4 h-4 text-amber-500" /> Nhật Ký
                          </>
                        )}
                      </span>
                      <Menu className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-[calc(100vw-2rem)] sm:w-[300px] glass-toast border-amber-500/20"
                  >
                    <DropdownMenuItem
                      onClick={() => setActiveTab("analytics")}
                      className={cn(
                        "gap-2 py-3",
                        activeTab === "analytics" &&
                        "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      <BarChart3
                        className={cn(
                          "w-4 h-4",
                          activeTab === "analytics"
                            ? "text-amber-500"
                            : "text-muted-foreground",
                        )}
                      />{" "}
                      Thống Kê
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("users")}
                      className={cn(
                        "gap-2 py-3 justify-between",
                        activeTab === "users" &&
                        "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Users
                          className={cn(
                            "w-4 h-4",
                            activeTab === "users"
                              ? "text-amber-500"
                              : "text-muted-foreground",
                          )}
                        />{" "}
                        Người Dùng
                      </div>
                      {pendingCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 text-[10px] px-1.5 animate-pulse"
                        >
                          {pendingCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("funds")}
                      className={cn(
                        "gap-2 py-3",
                        activeTab === "funds" &&
                        "bg-emerald-500/10 text-emerald-500",
                      )}
                    >
                      <Wallet
                        className={cn(
                          "w-4 h-4",
                          activeTab === "funds"
                            ? "text-emerald-500"
                            : "text-muted-foreground",
                        )}
                      />{" "}
                      Quỹ Họ
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("contributions")}
                      className={cn(
                        "gap-2 py-3 justify-between",
                        activeTab === "contributions" &&
                        "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare
                          className={cn(
                            "w-4 h-4",
                            activeTab === "contributions"
                              ? "text-amber-500"
                              : "text-muted-foreground",
                          )}
                        />{" "}
                        Đề Xuất
                      </div>
                      {contributions.filter((c) => c.status === APP_STATUS.PENDING)
                        .length > 0 && (
                          <Badge
                            variant="destructive"
                            className="h-5 text-[10px] px-1.5 animate-pulse"
                          >
                            {
                              contributions.filter((c) => c.status === APP_STATUS.PENDING)
                                .length
                            }
                          </Badge>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("logs")}
                      className={cn(
                        "gap-2 py-3",
                        activeTab === "logs" &&
                        "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      <ClipboardList
                        className={cn(
                          "w-4 h-4",
                          activeTab === "logs"
                            ? "text-amber-500"
                            : "text-muted-foreground",
                        )}
                      />{" "}
                      Nhật Ký Hoạt Động
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <TabsList className="hidden md:flex w-full h-auto gap-0 bg-transparent p-0 justify-start">
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/50 border border-transparent rounded-full px-4 py-2 gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Thống Kê</span>
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/50 border border-transparent rounded-full px-4 py-2 gap-2 relative"
                >
                  <Users className="w-4 h-4" />
                  <span>Người Dùng</span>
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="funds"
                  className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500/50 border border-transparent rounded-full px-4 py-2 gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Quỹ Họ</span>
                </TabsTrigger>
                <TabsTrigger
                  value="contributions"
                  className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/50 border border-transparent rounded-full px-4 py-2 gap-2 relative"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Đề Xuất</span>
                  {contributions.filter((c) => c.status === APP_STATUS.PENDING).length >
                    0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/50 border border-transparent rounded-full px-4 py-2 gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Nhật Ký</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="analytics"
              className="animate-in fade-in-50 duration-500 outline-none"
            >
              <AnalyticsTab />
            </TabsContent>

            <TabsContent
              value="funds"
              className="animate-in fade-in-50 duration-500 outline-none"
            >
              <FundManagerTab />
            </TabsContent>

            <TabsContent
              value="users"
              className="animate-in fade-in-50 duration-500 outline-none space-y-4"
            >
              {pendingCount > 0 && (
                <div className="glass rounded-xl p-4 border border-yellow-500/30 space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-yellow-500">
                    <Clock className="w-4 h-4" /> Thành viên chờ duyệt (
                    {pendingCount})
                  </h3>
                  <div className="space-y-2">
                    {profiles
                      .filter((p) => p.status === APP_STATUS.PENDING)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-600 shrink-0">
                              {p.full_name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {p.full_name ?? "Chưa đặt tên"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {p.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              className="flex-1 sm:flex-none h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() =>
                                setStatusModal({
                                  open: true,
                                  userId: p.id,
                                  userName: p.full_name ?? p.email ?? "",
                                  action: APP_STATUS.APPROVED,
                                })
                              }
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-none h-8 gap-1.5 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                              onClick={() =>
                                setStatusModal({
                                  open: true,
                                  userId: p.id,
                                  userName: p.full_name ?? p.email ?? "",
                                  action: APP_STATUS.REJECTED,
                                })
                              }
                            >
                              <X className="w-3.5 h-3.5" /> Từ chối
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" /> Quản lý người
                  dùng ({profiles.length})
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={() => setShowAddUser(!showAddUser)}
                >
                  <Plus className="w-3 h-3" /> Thêm mới
                </Button>
              </div>

              {showAddUser && (
                <form
                  onSubmit={handleAddUser}
                  className="glass rounded-xl p-4 border border-amber-500/30 flex flex-wrap gap-4 items-end animate-in slide-in-from-top-2"
                >
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50"
                      placeholder="******"
                    />
                  </div>
                  <div className="w-[140px] space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">
                      Vai trò
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50"
                    >
                      <option value={APP_ROLES.MEMBER}>Thành viên</option>
                      <option value={APP_ROLES.ACCOUNTANT}>Thủ quỹ</option>
                      <option value={APP_ROLES.ADMIN}>Admin</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    disabled={isCreatingUser}
                    className="h-9 shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isCreatingUser ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Lưu"
                    )}
                  </Button>
                </form>
              )}

              <div className="space-y-2">
                {profiles
                  .filter((p) => p.status !== APP_STATUS.PENDING)
                  .map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        "glass rounded-xl p-3 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all duration-200 hover:bg-white/5",
                        p.id === currentUserId && "border-amber-400/30",
                      )}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-sm font-bold text-amber-900 shrink-0">
                          {p.full_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium truncate">
                              {p.full_name ?? "Chưa đặt tên"}
                            </p>
                            {p.id === currentUserId && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-500"
                              >
                                Bạn
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.email}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {p.created_at
                              ? new Date(p.created_at).toLocaleDateString(
                                "vi-VN",
                              )
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0 pt-2 sm:pt-0 mt-2 border-t border-border/40 sm:border-0 sm:mt-0">
                        {getRoleBadge(p.role)}
                        {getStatusBadge(p.status)}
                        {p.id !== currentUserId && (
                          <>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs gap-1 ml-auto sm:ml-0"
                                >
                                  Vai trò ▾
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="glass-toast border-amber-500/20"
                              >
                                <DropdownMenuItem
                                  onClick={() => updateRole(p.id, APP_ROLES.MEMBER)}
                                  className={cn(
                                    "gap-2",
                                    p.role === APP_ROLES.MEMBER && "bg-amber-500/10",
                                  )}
                                >
                                  <UserCheck className="w-3.5 h-3.5" /> Thành
                                  viên
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateRole(p.id, APP_ROLES.ACCOUNTANT)}
                                  className={cn(
                                    "gap-2",
                                    p.role === APP_ROLES.ACCOUNTANT &&
                                    "bg-emerald-500/10",
                                  )}
                                >
                                  <Wallet className="w-3.5 h-3.5" /> Thủ quỹ
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateRole(p.id, APP_ROLES.ADMIN)}
                                  className={cn(
                                    "gap-2",
                                    p.role === APP_ROLES.ADMIN && "bg-amber-500/10",
                                  )}
                                >
                                  <Shield className="w-3.5 h-3.5" /> Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              aria-label="Xóa người dùng"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              title="Xóa người dùng"
                              onClick={() => showDeleteConfirm({ id: p.id, name: p.full_name ?? p.email ?? "" })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent
              value="logs"
              className="animate-in fade-in-50 duration-500 outline-none space-y-4"
            >
              <h2 className="text-sm font-bold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-500" /> Nhật ký hoạt động
              </h2>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="glass rounded-xl p-3 border border-border/40 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-bold text-amber-600 uppercase">
                          {log.action === "INSERT"
                            ? "Thêm mới"
                            : log.action === "UPDATE"
                              ? "Cập nhật"
                              : log.action === "DELETE"
                                ? "Xóa"
                                : log.action}
                        </span>{" "}
                        trên bảng{" "}
                        <span className="italic font-medium">
                          {log.table_name === "profiles"
                            ? "Người dùng"
                            : log.table_name === "contributions"
                              ? "Bài viết"
                              : log.table_name === "media"
                                ? "Thư viện"
                                : log.table_name === "members"
                                  ? "Gia phả"
                                  : log.table_name}
                        </span>{" "}
                        <span className="text-xs text-muted-foreground">
                          (ID record: {log.record_id.slice(0, 8)}...)
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString("vi-VN")
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="contributions"
              className="animate-in fade-in-50 duration-500 outline-none space-y-4"
            >
              <h2 className="text-sm font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" /> Phê duyệt đóng góp
              </h2>
              <div className="space-y-4">
                {contributions.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground text-sm">
                    Chưa có đóng góp nào
                  </p>
                ) : (
                  contributions.map((c) => (
                    <div
                      key={c.id}
                      className="glass rounded-xl p-4 border border-border/60 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {c.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {c.created_at ? new Date(c.created_at).toLocaleString("vi-VN") : ""}
                          </span>
                        </div>
                        {getStatusBadge(c.status)}
                      </div>
                      <p className="text-sm">{c.content}</p>
                      {c.status === APP_STATUS.PENDING && (
                        <div className="flex gap-2 pt-2 border-t border-border/40">
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => updateContrib(c.id, APP_STATUS.APPROVED)}
                          >
                            <Check className="w-3.5 h-3.5" /> Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                            onClick={() => updateContrib(c.id, APP_STATUS.REJECTED)}
                          >
                            <X className="w-3.5 h-3.5" /> Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa người dùng ${deleteModalData?.name}? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteUser}
        loading={isDeleting}
        variant="destructive"
      />

      <ConfirmModal
        open={statusModal.open}
        onOpenChange={(open) => setStatusModal((prev) => ({ ...prev, open }))}
        title={statusModal.action === APP_STATUS.APPROVED ? "Phê duyệt thành viên" : "Từ chối thành viên"}
        description={`Bạn có chắc chắn muốn ${statusModal.action === APP_STATUS.APPROVED ? "phê duyệt" : "từ chối"} thành viên ${statusModal.userName}?`}
        onConfirm={confirmStatusChange}
        loading={isUpdatingStatus}
        variant={statusModal.action === APP_STATUS.APPROVED ? "success" : "destructive"}
      />
    </div>
  );
}
