"use client";

import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";

type TreeToolbarProps = {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    onFitScreen: () => void;
};

export function TreeToolbar({
    onZoomIn,
    onZoomOut,
    onReset,
    onFitScreen,
}: TreeToolbarProps) {
    const btnClass = `
    flex items-center justify-center w-9 h-9
    rounded-lg bg-card/80 border border-border/50
    text-muted-foreground backdrop-blur-sm
    transition-all duration-200 cursor-pointer
    hover:bg-card hover:text-heritage-gold hover:border-heritage-gold-dim/60
    hover:shadow-[0_0_12px_rgba(230,200,117,0.1)]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
  `;

    return (
        <div
            className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5"
            role="toolbar"
            aria-label="Điều khiển bản đồ"
        >
            <button
                className={btnClass}
                onClick={onZoomIn}
                aria-label="Phóng to"
                type="button"
            >
                <ZoomIn className="w-4 h-4" />
            </button>
            <button
                className={btnClass}
                onClick={onZoomOut}
                aria-label="Thu nhỏ"
                type="button"
            >
                <ZoomOut className="w-4 h-4" />
            </button>
            <button
                className={btnClass}
                onClick={onFitScreen}
                aria-label="Vừa màn hình"
                type="button"
            >
                <Maximize className="w-4 h-4" />
            </button>
            <button
                className={btnClass}
                onClick={onReset}
                aria-label="Đặt lại vị trí"
                type="button"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
        </div>
    );
}
