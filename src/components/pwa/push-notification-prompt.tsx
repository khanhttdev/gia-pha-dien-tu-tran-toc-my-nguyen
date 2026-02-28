"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Bell, X, Loader2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "default") return;

    const dismissed = localStorage.getItem("push-notification-dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => setShowPrompt(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = (persist = false) => {
    setIsExiting(true);
    if (persist) localStorage.setItem("push-notification-dismissed", "true");
    setTimeout(() => {
      setShowPrompt(false);
      setIsExiting(false);
    }, 300);
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        dismiss();
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn("VAPID public key not configured");
        dismiss();
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subJson = subscription.toJSON();

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("push_subscriptions").upsert(
          {
            user_id: user.id,
            endpoint: subJson.endpoint!,
            p256dh: subJson.keys!.p256dh,
            auth_key: subJson.keys!.auth,
          },
          { onConflict: "endpoint" },
        );
      }

      dismiss(true);
    } catch (err) {
      console.error("Push subscription error:", err);
    }
    setLoading(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      className={`fixed bottom-20 right-4 z-50 w-[calc(100%-2rem)] sm:w-[360px] rounded-2xl border border-blue-500/20 bg-background/90 backdrop-blur-xl shadow-2xl shadow-black/20 p-4 transition-all duration-300 ${
        isExiting
          ? "translate-y-4 opacity-0"
          : "animate-in slide-in-from-bottom-4 fade-in-0 duration-500"
      }`}
      role="dialog"
      aria-label="Bật thông báo"
    >
      <button
        onClick={() => dismiss(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Đóng"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shadow-lg shrink-0">
          <Bell className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold leading-tight">Bật thông báo</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Nhận tin mới từ dòng họ: lịch giỗ, sự kiện, bình luận,...
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-9 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => dismiss(true)}
          disabled={loading}
        >
          Để sau
        </Button>
        <Button
          size="sm"
          className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-md shadow-blue-500/20"
          onClick={handleEnable}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Bell className="w-3.5 h-3.5" />
          )}
          Bật thông báo
        </Button>
      </div>
    </div>
  );
}
