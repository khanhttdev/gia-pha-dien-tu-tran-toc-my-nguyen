import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/layout/sidebar";
import { MeiChatWidget } from "@/components/chat/mei-chat-widget";
import { redirect } from "next/navigation";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { PushNotificationPrompt } from "@/components/pwa/push-notification-prompt";
import { PendingUserPopup } from "@/components/pwa/pending-user-popup";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
      {profile?.status === "approved" && <MeiChatWidget />}
      <PwaInstallPrompt />
      <PushNotificationPrompt />
      <PendingUserPopup />
    </div>
  );
}
