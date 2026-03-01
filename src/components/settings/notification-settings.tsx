"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bell, BellOff, Loader2, Mail, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationPref {
    id: string;
    user_id: string;
    channel: string;
    event_types: string[];
    reminder_days: number;
    is_enabled: boolean;
}

const EVENT_TYPE_OPTIONS = [
    { value: "gio_to", label: "🕯️ Giỗ Tổ / Giỗ thành viên" },
    { value: "hop_mat", label: "🎉 Họp mặt dòng họ" },
    { value: "sinh_nhat", label: "🎂 Sinh nhật" },
];

export function NotificationSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pref, setPref] = useState<NotificationPref | null>(null);
    const [enabled, setEnabled] = useState(true);
    const [reminderDays, setReminderDays] = useState(3);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(["gio_to"]);

    useEffect(() => {
        const load = async () => {
            const sb = createClient();
            const { data: userData } = await sb.auth.getUser();
            if (!userData.user) return setLoading(false);

            const { data } = await sb
                .from("notification_preferences" as any)
                .select("*")
                .eq("user_id", userData.user.id)
                .eq("channel", "email")
                .maybeSingle();

            if (data) {
                const typedData = data as any;
                setPref(typedData);
                setEnabled(typedData.is_enabled);
                setReminderDays(typedData.reminder_days);
                setSelectedTypes(typedData.event_types ?? ["gio_to"]);
            }
            setLoading(false);
        };
        load();
    }, []);

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        const sb = createClient();
        const { data: userData } = await sb.auth.getUser();
        if (!userData.user) return setSaving(false);

        const payload = {
            user_id: userData.user.id,
            channel: "email",
            event_types: selectedTypes,
            reminder_days: reminderDays,
            is_enabled: enabled,
            updated_at: new Date().toISOString(),
        };

        if (pref) {
            const { error } = await sb
                .from("notification_preferences" as any)
                .update(payload)
                .eq("id", pref.id);
            if (error) toast.error(error.message);
            else toast.success("Đã cập nhật cài đặt thông báo!");
        } else {
            const { error, data } = await sb
                .from("notification_preferences" as any)
                .insert(payload)
                .select()
                .single();
            if (error) toast.error(error.message);
            else {
                setPref(data as any);
                toast.success("Đã kích hoạt thông báo nhắc nhở!");
            }
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {enabled ? (
                        <Bell className="w-5 h-5 text-amber-500" />
                    ) : (
                        <BellOff className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                        <p className="font-semibold text-sm">Nhắc nhở qua Email</p>
                        <p className="text-xs text-muted-foreground">
                            Nhận email khi có ngày giỗ sắp tới
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setEnabled(!enabled)}
                    className={cn(
                        "w-11 h-6 rounded-full transition-colors relative",
                        enabled ? "bg-amber-500" : "bg-muted"
                    )}
                    aria-label="Bật tắt thông báo"
                >
                    <span
                        className={cn(
                            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                            enabled ? "translate-x-5.5" : "translate-x-0.5"
                        )}
                    />
                </button>
            </div>

            {enabled && (
                <>
                    {/* Reminder Days */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-amber-600" />
                            Nhắc trước bao nhiêu ngày?
                        </Label>
                        <Input
                            type="number"
                            min={1}
                            max={30}
                            value={reminderDays}
                            onChange={(e) => setReminderDays(Number(e.target.value))}
                            className="w-24"
                        />
                        <p className="text-xs text-muted-foreground">
                            Bạn sẽ nhận email nhắc nhở trước {reminderDays} ngày.
                        </p>
                    </div>

                    {/* Event Types */}
                    <div className="space-y-2">
                        <Label>Loại sự kiện muốn nhận nhắc nhở</Label>
                        <div className="space-y-2">
                            {EVENT_TYPE_OPTIONS.map((opt) => (
                                <label
                                    key={opt.value}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                        selectedTypes.includes(opt.value)
                                            ? "border-amber-500/50 bg-amber-500/5"
                                            : "border-border/40 hover:border-border"
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(opt.value)}
                                        onChange={() => toggleType(opt.value)}
                                        className="accent-amber-500 w-4 h-4"
                                    />
                                    <span className="text-sm">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Save */}
            <div className="pt-2">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gold-gradient text-amber-950 font-semibold gap-2"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Lưu cài đặt
                </Button>
            </div>
        </div>
    );
}
