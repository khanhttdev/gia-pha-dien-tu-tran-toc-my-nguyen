import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { LandingPage } from "@/components/landing/landing-page";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let authState: "unauthenticated" | "pending" | "approved" = "unauthenticated";

  if (user) {
    const status = user.app_metadata?.status;
    if (status === "approved") {
      redirect("/home");
    } else {
      authState = "pending";
    }
  }

  // Fetch family stats server-side (bypass RLS)
  let stats = { generations: 6, totalMembers: 420, yearsOfHistory: 180 };
  try {
    const [membersRes, spousesRes, genRes, birthRes] = await Promise.all([
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase.from("spouses").select("*", { count: "exact", head: true }),
      supabase.from("members").select("generation_level").order("generation_level", { ascending: false }).limit(1),
      supabase.from("members").select("metadata").order("created_at", { ascending: true }).limit(1),
    ]);

    const totalMembers = (membersRes.count ?? 0) + (spousesRes.count ?? 0);
    const maxGen = genRes.data?.[0]?.generation_level ?? 6;

    // Calculate years of history from earliest birth_year in metadata
    let yearsOfHistory = 180;
    if (birthRes.data?.[0]?.metadata) {
      const meta = birthRes.data[0].metadata as Record<string, unknown>;
      const birthYear = typeof meta.birth_year === "number" ? meta.birth_year : null;
      if (birthYear) {
        yearsOfHistory = new Date().getFullYear() - birthYear;
      }
    }

    stats = { generations: maxGen, totalMembers, yearsOfHistory };
  } catch {
    // Fallback to defaults if DB query fails
  }

  return <LandingPage authState={authState} stats={stats} />;
}
