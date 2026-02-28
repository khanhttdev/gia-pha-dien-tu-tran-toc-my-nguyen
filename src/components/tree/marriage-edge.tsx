import { BaseEdge, EdgeProps, getStraightPath } from "@xyflow/react";

export function MarriageEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: "var(--color-heritage-gold-dim)",
                    strokeWidth: 3,
                    strokeDasharray: "5,5",
                    opacity: 0.6
                }}
            />
            <foreignObject
                width={30}
                height={30}
                x={centerX - 15}
                y={centerY - 15}
                className="overflow-visible pointer-events-none"
            >
                <div className="w-full h-full flex items-center justify-center bg-[#1a0505] border border-[var(--color-heritage-gold-dim)] rounded-full shadow-[0_0_10px_rgba(230,200,117,0.5)]">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-heritage-gold)]">
                        <circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                        <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </div>
            </foreignObject>
        </>
    );
}
