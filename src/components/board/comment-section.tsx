"use client";

import { useState, useEffect } from "react";
import { getComments, addComment } from "@/lib/board-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Send, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CommentSectionProps {
  contributionId: string;
  currentUserId: string | null;
}

export function CommentSection({
  contributionId,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    const res = await getComments(contributionId);
    if (res.data) setComments(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [contributionId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return toast.error("Bạn cần đăng nhập để bình luận");
    if (!newComment.trim()) return;

    setSubmitting(true);
    const res = await addComment(contributionId, newComment);
    if (res.error) {
      toast.error(res.error);
    } else {
      setNewComment("");
      await loadComments();
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/40 space-y-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <MessageSquare className="w-3 h-3" />
        Thảo luận ({comments.length})
      </div>

      {/* Comment List */}
      <div className="space-y-3">
        {loading && comments.length === 0 ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic px-2">
            Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <div className="shrink-0">
                {comment.author?.avatar_url ? (
                  <img
                    src={comment.author.avatar_url}
                    alt="avt"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <UserCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 bg-secondary/30 rounded-2xl px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-foreground/80">
                    {comment.author?.full_name || "Thành viên"}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {comment.created_at ? new Date(comment.created_at).toLocaleDateString("vi-VN") : ""}
                  </span>
                </div>
                <p className="text-xs text-foreground/90 mt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleAddComment}
        className="flex gap-2 items-center pt-2"
      >
        <div className="flex-1 relative">
          <Input
            placeholder="Nhập bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!currentUserId || submitting}
            className="h-9 rounded-full bg-background/50 text-xs px-4 focus-visible:ring-amber-500/50"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={!currentUserId || submitting || !newComment.trim()}
          className="h-9 w-9 rounded-full text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 shrink-0"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
      {!currentUserId && (
        <p className="text-[10px] text-muted-foreground text-center">
          Vui lòng đăng nhập để bình luận.
        </p>
      )}
    </div>
  );
}
