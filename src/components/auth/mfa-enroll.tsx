"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ShieldAlert, Key, Smartphone } from "lucide-react";
import { toast } from "sonner";

export function MFAEnroll() {
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [factorId, setFactorId] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [authCode, setAuthCode] = useState("");
    const [isMFAEnabled, setIsMFAEnabled] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        checkMFAStatus();
    }, []);

    const checkMFAStatus = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) {
            console.error("Error listing factors:", error);
        } else {
            const totpFactor = data.all.find(
                (factor) => factor.factor_type === "totp" && factor.status === "verified"
            );
            setIsMFAEnabled(!!totpFactor);
        }
        setLoading(false);
    };

    const startEnroll = async () => {
        setEnrolling(true);
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: "totp",
            issuer: "Trần Tộc Mỹ Nguyên",
        });

        if (error) {
            toast.error("Lỗi khi bắt đầu đăng ký: " + error.message);
            setEnrolling(false);
            return;
        }

        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setEnrolling(false);
    };

    const verifyEnroll = async () => {
        if (!factorId) return;
        setVerifying(true);

        const challenge = await supabase.auth.mfa.challenge({ factorId });
        if (challenge.error) {
            toast.error("Lỗi khi tạo thử thách: " + challenge.error.message);
            setVerifying(false);
            return;
        }

        const { error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challenge.data.id,
            code: authCode,
        });

        if (error) {
            toast.error("Mã xác thực không đúng. Vui lòng thử lại.");
        } else {
            toast.success("Đã kích hoạt xác thực 2 lớp thành công!");
            setIsMFAEnabled(true);
            setFactorId(null);
            setQrCode(null);
        }
        setVerifying(false);
    };

    const unenroll = async () => {
        if (!confirm("Bạn có chắc chắn muốn tắt xác thực 2 lớp? Điều này sẽ làm giảm bảo mật tài khoản của bạn.")) {
            return;
        }

        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.all.find(f => f.factor_type === 'totp' && f.status === 'verified');

        if (!totpFactor) return;

        const { error } = await supabase.auth.mfa.unenroll({
            factorId: totpFactor.id
        });

        if (error) {
            toast.error("Lỗi khi hủy đăng ký: " + error.message);
        } else {
            toast.success("Đã tắt xác thực 2 lớp.");
            setIsMFAEnabled(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang kiểm tra trạng thái bảo mật...
            </div>
        );
    }

    if (isMFAEnabled) {
        return (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-emerald-500">Đã bật xác thực 2 lớp</h4>
                        <p className="text-xs text-muted-foreground">Tài khoản của bạn đang được bảo vệ bởi Google Authenticator.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={unenroll} className="text-destructive hover:text-destructive">
                    Tắt 2FA
                </Button>
            </div>
        );
    }

    if (qrCode) {
        return (
            <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="w-6 h-6 text-amber-500" />
                    <h4 className="font-semibold">Quét mã QR để đăng ký</h4>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="bg-white p-2 rounded-lg shrink-0">
                        <QRCodeSVG value={qrCode} size={180} />
                    </div>

                    <div className="space-y-4 flex-1">
                        <p className="text-sm text-muted-foreground">
                            1. Mở ứng dụng <strong>Google Authenticator</strong> trên điện thoại.<br />
                            2. Chọn dấu &quot;+&quot; và chọn <strong>Quét mã QR</strong>.<br />
                            3. Sau khi quét, nhập mã 6 số hiển thị trên điện thoại vào ô bên dưới.
                        </p>

                        <div className="flex items-center gap-2">
                            <Input
                                value={authCode}
                                onChange={(e) => setAuthCode(e.target.value)}
                                placeholder="Nhập mã 6 số"
                                maxLength={6}
                                className="w-32 text-center text-lg tracking-widest font-mono"
                            />
                            <Button onClick={verifyEnroll} disabled={verifying || authCode.length !== 6} className="gold-gradient text-amber-950 font-bold">
                                {verifying && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Xác nhận
                            </Button>
                        </div>

                        <div className="pt-2">
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Key className="w-3 h-3" />
                                Nếu không quét được mã, hãy nhập mã thủ công: <code className="bg-amber-500/10 px-1 rounded">{secret}</code>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setQrCode(null); setFactorId(null); }} className="text-xs">
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-semibold">Xác thực 2 lớp (2FA)</h4>
                    <p className="text-xs text-muted-foreground">Tăng cường bảo mật cho tài khoản quản trị.</p>
                </div>
            </div>
            <Button onClick={startEnroll} disabled={enrolling} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30">
                {enrolling && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Kích hoạt
            </Button>
        </div>
    );
}
