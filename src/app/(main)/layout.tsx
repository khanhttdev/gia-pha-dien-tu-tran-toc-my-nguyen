import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/layout/sidebar";
import { ClientWidgets } from "@/components/layout/client-widgets";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Single auth call — required by Supabase SSR for cookie refresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Single profile query (needed for avatar_url which is only in DB)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, status")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar profile={profile as any} />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0 flex flex-col">
        <div className="page-enter flex-1 h-full min-h-0">{children}</div>
      </main>
      <ClientWidgets isApproved={profile?.status === "approved"} />
    </div>
  );
}
