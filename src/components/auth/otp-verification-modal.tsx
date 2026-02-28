"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getVietnameseAuthError } from "@/lib/auth-errors";

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    contactInfo: string; // Email or Phone number
    type: "email" | "phone";
}

export function OtpVerificationModal({
    isOpen,
    onClose,
    onVerify,
    onResend,
    contactInfo,
    type,
}: OtpVerificationModalProps) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, countdown]);

    const handleVerify = async () => {
        if (otp.length < 6) {
            toast.error("Vui lòng nhập đủ 6 chữ số");
            return;
        }
        setLoading(true);
        try {
            await onVerify(otp);
        } catch (error: any) {
            toast.error(getVietnameseAuthError(error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await onResend();
            setCountdown(60);
            toast.success("Mã mới đã được gửi!");
        } catch (error: any) {
            toast.error(getVietnameseAuthError(error.message));
        } finally {
            setResending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
            <DialogContent className="sm:max-w-md glass border-amber-200/20 rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-foreground font-serif">
                        Xác thực tài khoản
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Vui lòng nhập mã OTP đã được gửi đến {type === "email" ? "email" : "số điện thoại"}:{" "}
                        <span className="font-bold text-primary">{contactInfo}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-4">
                    <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="text-center text-3xl tracking-[1rem] font-bold h-16 rounded-2xl bg-white/50 border-amber-200/30 focus:ring-amber-500/30"
                        disabled={loading}
                        autoFocus
                    />

                    <Button
                        onClick={handleVerify}
                        className="w-full h-12 rounded-xl gold-gradient border-0 text-amber-950 font-bold text-lg shadow-md hover:shadow-lg transition-all"
                        disabled={loading || otp.length < 6}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Xác nhận
                    </Button>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Bạn không nhận được mã?
                        </p>
                        <Button
                            variant="link"
                            onClick={handleResend}
                            disabled={countdown > 0 || resending}
                            className="text-amber-600 font-bold hover:text-amber-700 p-0 h-auto"
                        >
                            {resending ? (
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi lại mã ngay"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
