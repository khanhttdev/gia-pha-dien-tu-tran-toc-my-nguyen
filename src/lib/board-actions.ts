"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { BoardFeedItem, CommentWithAuthor } from "@/lib/types";
import { APP_STATUS, MEDIA_TYPES, APP_PATHS } from "@/lib/constants";
import { verifyAdmin, actionHandler } from "@/lib/server-utils";

/**
 * Lấy danh sách đóng góp hợp lệ hiển thị lên Bảng tin (Newsfeed).
 * Hỗ trợ offset-based pagination thông qua page + pageSize.
 */
export async function getBoardFeed(page = 0, pageSize = 20) {
  return actionHandler(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Không tìm thấy thông tin đăng nhập");

    const from = page * pageSize;
    const to = from + pageSize - 1;

    // RLS sẽ tự lọc: user chỉ thấy "approved" hoặc bài của chính mình (pending/rejected)
    const { data, error } = await supabase
      .from("contributions")
      .select(
        `
            *,
            author:profiles!contributions_author_id_fkey(full_name, avatar_url),
            comments(count)
        `,
      )
      .order("created_at", { ascending: false })
      .range(from, to + 1); // fetch 1 extra để detect hasMore

    const hasMore = (data?.length ?? 0) > pageSize;
    const items = hasMore ? data!.slice(0, pageSize) : (data ?? []);

    return { items: items as BoardFeedItem[], hasMore };
  });
}

/**
 * Gửi đóng góp / đề xuất mới. Mặc định status sẽ là 'pending'.
 */
export async function submitContribution(formData: FormData) {
  return actionHandler(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Vui lòng đăng nhập để gửi đóng góp");

    const content = (formData.get("content") as string) || "";
    const type = formData.get("type") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const mediaType = formData.get("mediaType") as string; // "image" | "video"

    if (!type || (!content.trim() && !imageUrl)) {
      return { error: "Vui lòng nhập nội dung hoặc đính kèm ảnh" };
    }

    const proposed_data = imageUrl ? { image_url: imageUrl } : null;

    const { error } = await supabase.from("contributions").insert({
      author_id: user.id,
      content: content.trim() || "Có đính kèm " + (mediaType === MEDIA_TYPES.VIDEO ? "video." : "hình ảnh."),
      type: type,
      status: APP_STATUS.APPROVED,
      proposed_data: proposed_data,
    });

    if (error) throw error;

    if (imageUrl) {
      const isVideo = mediaType === MEDIA_TYPES.VIDEO;

      const { error: mediaError } = await supabase.from("media").insert({
        title: (isVideo ? "Video" : "Ảnh") + " từ Bản tin: " + (content.substring(0, 30) || "Tải lên mới"),
        description: content.substring(0, 150),
        url: imageUrl,
        type: isVideo ? MEDIA_TYPES.VIDEO : MEDIA_TYPES.IMAGE,
        uploaded_by: user.id,
        year: new Date().getFullYear(),
      });

      if (mediaError) {
        console.error("Error adding to gallery from contribution:", mediaError);
      }
    }

    revalidatePath(APP_PATHS.BOARD);
    revalidatePath(APP_PATHS.MEDIA);
    return true;
  });
}

/**
 * Lấy danh sách bình luận của một bài đăng.
 */
export async function getComments(contributionId: string) {
  return actionHandler(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
              *,
              author:profiles(full_name, avatar_url)
          `,
      )
      .eq("contribution_id", contributionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as CommentWithAuthor[];
  });
}

/**
 * Thêm bình luận mới.
 */
export async function addComment(contributionId: string, content: string) {
  return actionHandler(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Vui lòng đăng nhập để bình luận");

    if (!content.trim()) {
      throw new Error("Nội dung bình luận không được để trống");
    }

    const { error } = await supabase.from("comments").insert({
      contribution_id: contributionId,
      author_id: user.id,
      content: content.trim(),
    });

    if (error) throw error;

    revalidatePath(APP_PATHS.BOARD);
    return true;
  });
}

/**
 * Xóa một bài đăng (chỉ dành cho Admin).
 */
export async function deleteContribution(id: string) {
  return actionHandler(async () => {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) throw new Error(adminCheck.error);

    // Xóa các bình luận liên quan trước để tránh lỗi khóa ngoại (nếu không có cascade)
    await adminCheck.supabase!.from("comments").delete().eq("contribution_id", id);

    const { error } = await adminCheck.supabase!.from("contributions").delete().eq("id", id);

    if (error) throw error;

    revalidatePath(APP_PATHS.BOARD);
    return true;
  });
}
