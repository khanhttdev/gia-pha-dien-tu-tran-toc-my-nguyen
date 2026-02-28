"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseConfirmModalOptions<T> {
    onConfirm: (data: T) => Promise<{ error: string | null } | any>;
    onSuccess?: () => void | Promise<void>;
    successMessage?: string;
    errorMessagePrefix?: string;
}

export function useConfirmModal<T>({
    onConfirm,
    onSuccess,
    successMessage = "Thực hiện thành công",
    errorMessagePrefix = "Lỗi: ",
}: UseConfirmModalOptions<T>) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);

    const showConfirm = useCallback((item: T) => {
        setData(item);
        setOpen(true);
    }, []);

    const closeConfirm = useCallback(() => {
        setOpen(false);
        setData(null);
        setLoading(false);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!data) return;
        setLoading(true);
        try {
            const res = await onConfirm(data);
            if (res?.error) {
                toast.error(`${errorMessagePrefix}${res.error}`);
            } else {
                toast.success(successMessage);
                if (onSuccess) await onSuccess();
                setOpen(false);
                setData(null);
            }
        } catch (error: any) {
            toast.error(`${errorMessagePrefix}${error.message || "Đã xảy ra lỗi"}`);
        } finally {
            setLoading(false);
        }
    }, [data, onConfirm, onSuccess, successMessage, errorMessagePrefix]);

    return {
        open,
        setOpen,
        data,
        loading,
        showConfirm,
        closeConfirm,
        handleConfirm,
    };
}
