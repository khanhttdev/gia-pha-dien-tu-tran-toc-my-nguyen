"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

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

    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: isMarriage ? 0 : 12,
    });

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            style={{
                stroke: isMarriage ? "rgba(200, 130, 160, 0.4)" : "rgba(230, 200, 117, 0.25)",
                strokeWidth: isMarriage ? 1.5 : 1.5,
                strokeDasharray: isMarriage ? "6 4" : undefined,
            }}
        />
    );
}
