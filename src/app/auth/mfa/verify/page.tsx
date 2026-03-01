"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function MFAVerifyPage() {
    const [authCode, setAuthCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/admin";

    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            // Check if already AAL2
            const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (aal?.currentLevel === 'aal2') {
                router.push(redirect);
                return;
            }

            setLoading(false);
        };
        checkSession();
    }, [router, redirect]);

    const handleVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (authCode.length !== 6) return;

        setVerifying(true);

        // 1. List factors to get the ID
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.all.find(f => f.factor_type === 'totp' && f.status === 'verified');

        if (!totpFactor) {
            toast.error("Không tìm thấy yếu tố xác thực 2 lớp. Vui lòng liên hệ quản trị viên.");
            setVerifying(false);
            return;
        }

        // 2. Challenge
        const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        if (challenge.error) {
            toast.error("Lỗi khi tạo thử thách: " + challenge.error.message);
            setVerifying(false);
            return;
        }

        // 3. Verify
        const { error } = await supabase.auth.mfa.verify({
            factorId: totpFactor.id,
            challengeId: challenge.data.id,
            code: authCode,
        });

        if (error) {
            toast.error("Mã xác thực không đúng. Vui lòng thử lại.");
        } else {
            toast.success("Xác thực thành công!");
            router.push(redirect);
        }
        setVerifying(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-heritage-maroon)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-heritage-gold)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-heritage-maroon)] p-4 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e6c875\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
            </div>

            <div className="max-w-md w-full glass p-8 rounded-2xl border border-[var(--color-heritage-gold-dim)]/30 relative z-10 shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-heritage-gold)]/20 flex items-center justify-center text-[var(--color-heritage-gold)]">
                        <ShieldCheck className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold font-serif text-[var(--color-heritage-gold)] uppercase tracking-widest">
                            Xác nhận Bảo mật
                        </h1>
                        <p className="text-sm text-amber-100/70">
                            Vui lòng nhập mã xác thực từ ứng dụng <strong>Authenticator</strong> trên thiết bị của bạn.
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="w-full space-y-6 pt-4">
                        <div className="space-y-2">
                            <Input
                                value={authCode}
                                onChange={(e) => setAuthCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                                className="text-center text-3xl h-16 tracking-[0.5em] font-mono bg-black/40 border-[var(--color-heritage-gold-dim)]/40 text-[var(--color-heritage-gold)] focus:border-[var(--color-heritage-gold)]"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={verifying || authCode.length !== 6}
                            className="w-full h-12 gold-gradient text-amber-950 font-bold text-lg group"
                        >
                            {verifying ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Tiếp tục
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-xs text-amber-100/40">
                        Nếu bạn gặp sự cố, vui lòng liên hệ Ban quản trị để được hỗ trợ.
                    </p>
                </div>
            </div>
        </div>
    );
}
