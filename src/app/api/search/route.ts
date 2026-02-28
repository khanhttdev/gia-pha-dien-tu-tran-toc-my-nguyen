import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q || q.trim().length === 0) return NextResponse.json([]);

  const supabase = await createClient();

  // Tìm kiếm song song trên 4 bảng
  const [membersRes, spousesRes, eventsRes, postsRes] = await Promise.all([
    supabase
      .from("members")
      .select("id, full_name, generation_level, gender")
      .ilike("full_name", `%${q}%`)
      .limit(5),
    supabase
      .from("spouses")
      .select("id, full_name, member_id, role_type")
      .ilike("full_name", `%${q}%`)
      .limit(5),
    supabase
      .from("events")
      .select("id, title, event_date")
      .ilike("title", `%${q}%`)
      .limit(5),
    supabase
      .from("contributions")
      .select("id, content, type")
      .ilike("content", `%${q}%`)
      .eq("status", "approved")
      .limit(5),
  ]);

  const results = [
    ...(membersRes.data || []).map((m) => ({
      type: "member",
      id: m.id,
      title: m.full_name,
      subtitle: `Đời ${m.generation_level || "?"} • ${m.gender === "male" ? "Nam" : "Nữ"}`,
      url: `/people/${m.id}`,
    })),
    ...(spousesRes.data || []).map((s) => ({
      type: "spouse",
      id: s.id,
      title: s.full_name,
      subtitle: `Phối ngẫu • ${s.role_type === "chong" ? "Chồng" : "Vợ"}`,
      url: `/people/${s.member_id}`,
    })),
    ...(eventsRes.data || []).map((e) => ({
      type: "event",
      id: e.id,
      title: e.title,
      subtitle: `Sự kiện • ${new Date(e.event_date).toLocaleDateString("vi-VN")}`,
      url: `/events`, // We don't have event detail page yet, just scroll to it or go to events
    })),
    ...(postsRes.data || []).map((p) => ({
      type: "board",
      id: p.id,
      title: p.content.substring(0, 60) + (p.content.length > 60 ? "..." : ""),
      subtitle: `Bảng tin • ${p.type}`,
      url: `/board`,
    })),
  ];

  return NextResponse.json(results);
}
