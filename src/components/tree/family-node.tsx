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

            {/* Node Card */}
            <div
                className="rounded-xl px-4 py-3.5 border-2 transition-all duration-300 group-hover:scale-105"
                style={{
                    background: d.isSpouse
                        ? "linear-gradient(145deg, #2a1520 0%, #1a0a15 100%)"
                        : "linear-gradient(145deg, #1c1a0c 0%, #0d0b05 100%)",
                    borderColor: d.isSpouse ? "rgba(200, 130, 160, 0.35)" : "rgba(230, 200, 117, 0.3)",
                    boxShadow: d.isSpouse
                        ? "0 4px 20px rgba(200,130,160,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                        : "0 4px 20px rgba(230,200,117,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
            >
                {/* Avatar + Info row */}
                <div className="flex items-center gap-3">
                    {/* Avatar — larger */}
                    <div
                        className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold overflow-hidden"
                        style={{
                            background: d.avatarUrl
                                ? "transparent"
                                : d.isSpouse
                                    ? "linear-gradient(135deg, #8b5a6b, #6b3a4b)"
                                    : "linear-gradient(135deg, #b8903a, #7a5e22)",
                            border: `2.5px solid ${d.isSpouse ? "rgba(200, 130, 160, 0.6)" : "rgba(230, 200, 117, 0.5)"}`,
                            color: "#f0e6c0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                    >
                        {d.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={d.avatarUrl}
                                alt={d.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                width={56}
                                height={56}
                            />
                        ) : (
                            d.name?.charAt(0)?.toUpperCase() || "?"
                        )}
                    </div>

                    {/* Text info — larger fonts */}
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-sm font-bold truncate leading-snug"
                            style={{ color: isDeceased ? "#b0a080" : "#f0e6c0" }}
                        >
                            {d.name}
                        </p>
                        {lifespan && (
                            <p className="text-xs mt-1" style={{ color: "#c8a55a" }}>
                                {lifespan}
                            </p>
                        )}
                        {d.role && (
                            <p
                                className="text-[10px] mt-0.5 uppercase tracking-wider font-medium"
                                style={{ color: d.isSpouse ? "#a0708a" : "#a08840" }}
                            >
                                {d.role}
                            </p>
                        )}
                    </div>
                </div>

                {/* Deceased indicator */}
                {isDeceased && (
                    <div
                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                        style={{ background: "rgba(180,160,120,0.6)" }}
                        title="Đã mất"
                    />
                )}
            </div>
        </div>
    );
}

export const FamilyNode = memo(FamilyNodeComponent);
