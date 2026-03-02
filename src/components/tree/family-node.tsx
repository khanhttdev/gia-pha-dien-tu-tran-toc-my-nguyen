"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FamilyNodeData } from "@/lib/tree-layout";

function FamilyNodeComponent({ data }: NodeProps) {
    const d = data as FamilyNodeData;
    const isDeceased = !!d.deathYear;

    const lifespan = d.birthYear
        ? d.deathYear ? `${d.birthYear} — ${d.deathYear}` : `${d.birthYear} — nay`
        : "";

    return (
        <div
            className="group relative cursor-pointer"
            style={{ width: 240 }}
        >
            {/* Handles */}
            <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
            <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />

            {/* Organic Gem/Leaf Card */}
            <div
                className="group-hover:scale-105 transition-all duration-300 relative flex items-center pr-4 pl-2 py-2"
                style={{
                    background: d.isSpouse
                        ? "rgba(42, 21, 32, 0.65)"
                        : "rgba(26, 9, 13, 0.65)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    // Organic leaf/drop shape: rounded top-left and bottom-right, slightly sharper others
                    borderRadius: d.isSpouse ? "30px 12px 30px 30px" : "12px 30px 30px 30px",
                    border: d.isSpouse
                        ? "1px solid rgba(200, 130, 160, 0.4)"
                        : "1px solid rgba(212, 175, 55, 0.5)",
                    boxShadow: d.isSpouse
                        ? "0 8px 32px rgba(200,130,160,0.15), inset 0 0 10px rgba(200,130,160,0.1)"
                        : "0 8px 32px rgba(212,175,55,0.15), inset 0 0 10px rgba(212,175,55,0.1)",
                }}
            >
                {/* Glowing Avatar */}
                <div
                    className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold overflow-hidden relative z-10 mr-3"
                    style={{
                        background: d.avatarUrl
                            ? "transparent"
                            : d.isSpouse
                                ? "linear-gradient(135deg, #8b5a6b, #4a1c22)"
                                : "linear-gradient(135deg, #d4af37, #8a6a1c)",
                        border: `2px solid ${d.isSpouse ? "rgba(200, 130, 160, 0.8)" : "rgba(212, 175, 55, 0.8)"}`,
                        color: d.avatarUrl ? "transparent" : (d.isSpouse ? "#f0e6c0" : "#1a090d"),
                        boxShadow: d.isSpouse
                            ? "0 0 15px rgba(200, 130, 160, 0.4)"
                            : "0 0 15px rgba(212, 175, 55, 0.5)",
                    }}
                >
                    {d.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={d.avatarUrl}
                            alt={d.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            width={64}
                            height={64}
                        />
                    ) : (
                        d.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                </div>

                {/* Text info */}
                <div className="flex-1 min-w-0 py-1">
                    <p
                        className="text-[15px] font-bold truncate leading-snug drop-shadow-md"
                        style={{ color: isDeceased ? "#b0a080" : "#f0e6c0" }}
                    >
                        {d.name}
                    </p>
                    {lifespan && (
                        <p className="text-[11px] mt-0.5 tracking-wide opacity-90" style={{ color: "#d4af37" }}>
                            {lifespan}
                        </p>
                    )}
                    {d.role && (
                        <p
                            className="text-[10px] mt-1 uppercase tracking-widest font-semibold opacity-80"
                            style={{ color: d.isSpouse ? "#c882a0" : "#a08840" }}
                        >
                            {d.role}
                        </p>
                    )}
                </div>

                {/* Deceased indicator gem */}
                {isDeceased && (
                    <div
                        className="absolute top-0 right-0 w-3 h-3 rounded-full transform translate-x-1/3 -translate-y-1/3"
                        style={{
                            background: "radial-gradient(circle at 30% 30%, #e6d8b8, #b0a080)",
                            boxShadow: "0 0 8px rgba(176,160,128,0.6)",
                            border: "1px solid rgba(26,9,13,0.8)"
                        }}
                        title="Đã mất"
                    />
                )}
            </div>
        </div>
    );
}

export const FamilyNode = memo(FamilyNodeComponent);
