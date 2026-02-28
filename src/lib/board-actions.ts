"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { BoardFeedItem, CommentWithAuthor } from "@/lib/types";

/**
 * Lấy danh sách đóng góp hợp lệ hiển thị lên Bảng tin (Newsfeed).
 * Hỗ trợ offset-based pagination thông qua page + pageSize.
 */
export async function getBoardFeed(page = 0, pageSize = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Không tìm thấy thông tin đăng nhập",
      data: null,
      hasMore: false,
    };
  }

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

  if (error) {
    console.error("Error fetching board feed:", error);
    return { error: error.message, data: null, hasMore: false };
  }

  const hasMore = (data?.length ?? 0) > pageSize;
  const items = hasMore ? data!.slice(0, pageSize) : (data ?? []);

  return { error: null, data: items as BoardFeedItem[], hasMore };
}

/**
 * Gửi đóng góp / đề xuất mới. Mặc định status sẽ là 'pending'.
 */
export async function submitContribution(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vui lòng đăng nhập để gửi đóng góp" };
  }

  const content = (formData.get("content") as string) || "";
  const type = formData.get("type") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!type || (!content.trim() && !imageUrl)) {
    return { error: "Vui lòng nhập nội dung hoặc đính kèm ảnh" };
  }

  const proposed_data = imageUrl ? { image_url: imageUrl } : null;

  const { error } = await supabase.from("contributions").insert({
    author_id: user.id,
    content: content.trim() || "Có đính kèm hình ảnh.",
    type: type,
    status: "pending",
    proposed_data: proposed_data,
  });

  if (error) {
    console.error("Error submitting contribution:", error);
    return { error: error.message };
  }

  // Nếu có tải ảnh lên, tự động cập nhật vào thư viện (media)
  if (imageUrl) {
    const { error: mediaError } = await supabase.from("media").insert({
      title: "Ảnh từ Bản tin: " + (content.substring(0, 30) || "Tải lên mới"),
      description: content.substring(0, 150),
      url: imageUrl,
      type: "image",
      uploaded_by: user.id,
      year: new Date().getFullYear(),
    });

    if (mediaError) {
      console.error("Error adding to gallery from contribution:", mediaError);
    }
  }

  revalidatePath("/board");
  revalidatePath("/media");
  return { error: null };
}

/**
 * Lấy danh sách bình luận của một bài đăng.
 */
export async function getComments(contributionId: string) {
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

  if (error) {
    console.error("Error fetching comments:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as CommentWithAuthor[] };
}

/**
 * Thêm bình luận mới.
 */
export async function addComment(contributionId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vui lòng đăng nhập để bình luận" };
  }

  if (!content.trim()) {
    return { error: "Nội dung bình luận không được để trống" };
  }

  const { error } = await supabase.from("comments").insert({
    contribution_id: contributionId,
    author_id: user.id,
    content: content.trim(),
  });

  if (error) {
    console.error("Error adding comment:", error);
    return { error: error.message };
  }

  revalidatePath("/board");
  return { error: null };
}
