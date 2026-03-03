"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export function FamilyEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}: EdgeProps) {
    const isMarriage = data?.isMarriage === true;

    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            style={{
                stroke: isMarriage ? "rgba(200, 130, 160, 0.4)" : "rgba(212, 175, 55, 0.6)",
                strokeWidth: isMarriage ? 1.5 : 2,
                strokeDasharray: isMarriage ? "6 4" : undefined,
                filter: isMarriage ? undefined : "drop-shadow(0px 0px 4px rgba(212, 175, 55, 0.5))",
            }}
        />
    );
}
