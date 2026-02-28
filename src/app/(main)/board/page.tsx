"use client";

import { useEffect, useState, useCallback } from "react";
import { getBoardFeed, submitContribution } from "@/lib/board-actions";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Loader2,
  Info,
  Clock,
  CheckCircle2,
  UserCircle2,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentSection } from "@/components/board/comment-section";
import type { BoardFeedItem } from "@/lib/types";

export default function BoardPage() {
  const [feed, setFeed] = useState<BoardFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState("news");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});

  const toggleComments = (id: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const loadFeed = useCallback(
    async (reset = true) => {
      if (reset) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 0 : page + 1;
      const res = await getBoardFeed(currentPage, 20);

      if (res.data) {
        setFeed((prev) => (reset ? res.data! : [...prev, ...res.data!]));
        setHasMore(res.hasMore);
        if (!reset) setPage(currentPage);
      }

      if (reset) setLoading(false);
      else setLoadingMore(false);
    },
    [page],
  );

  useEffect(() => {
    const fetchUser = async () => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
    loadFeed(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Vui lòng nhập nội dung");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("content", content);
    formData.append("type", type);

    const res = await submitContribution(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Gửi đóng góp thành công! Đang chờ BQT duyệt.");
      setContent("");
      await loadFeed(true); // Reset về trang 1
    }
    setSubmitting(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-amber-900 shadow-lg shadow-amber-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          Bảng Tin & Đóng Góp
        </h1>
        <p className="text-muted-foreground mt-2 ml-14">
          Nơi thông báo các tin tức công khai và gửi ý kiến đóng góp cho đại gia
          đình Trần Tộc.
        </p>
      </div>

      {/* Submit Form */}
      <div className="glass rounded-2xl p-5 sm:p-6 border border-amber-500/20 shadow-lg shadow-amber-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Send className="w-24 h-24" />
        </div>
        <h2 className="text-lg font-bold mb-4">Gửi đóng góp mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3 space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Loại thông tin
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="news">Tin tức / Thông báo</option>
                <option value="correction">Báo lỗi / Sửa gia phả</option>
                <option value="suggestion">Đề xuất ý kiến</option>
                <option value="event">Sự kiện họ tộc</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Nội dung
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung bạn muốn chia sẻ..."
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="gold-gradient text-amber-950 font-bold gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Gửi cho Ban Quản Trị
            </Button>
          </div>
        </form>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            Dòng Thời Gian
            {feed.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-2 py-0 h-5 text-[10px]"
              >
                {feed.length}
                {hasMore ? "+" : ""} bài đăng
              </Badge>
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadFeed(true)}
            disabled={loading}
            className="text-muted-foreground"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Làm mới"}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : feed.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-border/40">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-1">Chưa có bảng tin nào</h3>
            <p className="text-sm text-muted-foreground">
              Hãy là người đầu tiên gửi đóng góp cho gia phả!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feed.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "glass p-5 rounded-2xl border transition-all duration-300",
                  item.status === "pending"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : item.status === "rejected"
                      ? "border-red-500/30 bg-red-500/5 opacity-70 cursor-not-allowed"
                      : "border-border/40 hover:border-amber-500/20 hover:bg-white/5",
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 pt-1">
                    {item.author?.avatar_url ? (
                      <img
                        src={item.author.avatar_url}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-background"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground ring-2 ring-background">
                        <UserCircle2 className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {item.author?.full_name || "Thành viên ẩn danh"}
                        </span>
                        {item.author_id === currentUserId && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 border-amber-500/30 text-amber-500"
                          >
                            Bạn
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground px-1 hidden sm:inline">
                          •
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at!).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-medium bg-background/50"
                        >
                          {item.type === "news"
                            ? "Tin tức"
                            : item.type === "event"
                              ? "Sự kiện"
                              : item.type === "correction"
                                ? "Báo lỗi"
                                : "Tư vấn"}
                        </Badge>
                        {item.status === "pending" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500/50 text-amber-500 gap-1"
                          >
                            <Clock className="w-3 h-3" /> Chờ duyệt
                          </Badge>
                        )}
                        {item.status === "approved" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-emerald-500/50 text-emerald-500 gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Đã công khai
                          </Badge>
                        )}
                        {item.status === "rejected" && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] gap-1"
                          >
                            Từ chối
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>

                    {/* Action: Toggle Comments */}
                    {item.status === "approved" && (
                      <div className="mt-3 pt-3 border-t border-border/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 text-[11px] gap-1.5 px-3 rounded-full transition-all",
                            expandedComments[item.id]
                              ? "bg-amber-500/10 text-amber-500"
                              : "text-muted-foreground hover:bg-white/5",
                          )}
                          onClick={() => toggleComments(item.id)}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {expandedComments[item.id]
                            ? "Đóng bình luận"
                            : "Xem bình luận"}
                          {!expandedComments[item.id] &&
                            (item.comments?.[0] as any)?.count > 0 && (
                              <span className="ml-1 opacity-60">
                                ({(item.comments?.[0] as any)?.count})
                              </span>
                            )}
                        </Button>
                      </div>
                    )}

                    {/* Comment Section Content */}
                    {expandedComments[item.id] && (
                      <CommentSection
                        contributionId={item.id}
                        currentUserId={currentUserId}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => loadFeed(false)}
                  disabled={loadingMore}
                  className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/50 rounded-full px-8"
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {loadingMore ? "Đang tải..." : "Tải thêm bài"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
