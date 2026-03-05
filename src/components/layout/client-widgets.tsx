"use client";

import dynamic from "next/dynamic";

const MeiChatWidget = dynamic(
    () =>
        import("@/components/chat/mei-chat-widget").then((m) => m.MeiChatWidget),
    { ssr: false },
);
const PwaInstallPrompt = dynamic(
    () =>
        import("@/components/pwa/pwa-install-prompt").then(
            (m) => m.PwaInstallPrompt,
        ),
    { ssr: false },
);
const PushNotificationPrompt = dynamic(
    () =>
        import("@/components/pwa/push-notification-prompt").then(
            (m) => m.PushNotificationPrompt,
        ),
    { ssr: false },
);
const PendingUserPopup = dynamic(
    () =>
        import("@/components/pwa/pending-user-popup").then(
            (m) => m.PendingUserPopup,
        ),
    { ssr: false },
);

type ClientWidgetsProps = {
    isApproved: boolean;
};

export function ClientWidgets({ isApproved }: ClientWidgetsProps) {
    return (
        <>
            {isApproved && <MeiChatWidget />}
            <PwaInstallPrompt />
            <PushNotificationPrompt />
            <PendingUserPopup />
        </>
    );
}
