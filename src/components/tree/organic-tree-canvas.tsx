"use client";

import React from "react";
import { RecursiveFamily } from "@/app/types/treeType";
import { OrganicMemberNode } from "./organic-member-node";

interface OrganicTreeCanvasProps {
    data: RecursiveFamily;
}

export const OrganicTreeCanvas: React.FC<OrganicTreeCanvasProps> = ({ data }) => {
    return (
        <div className="min-h-screen w-full bg-[#1a0003] bg-radial-gradient from-[#2a0005] via-[#1a0003] to-[#0a0000] p-8 md:p-16 flex flex-col items-center justify-end overflow-auto">
            {/* The tree roots/trunk would be a complex SVG, for MVP we use a vertical hierarchical layout growing UP */}
            <div className="relative w-full max-w-7xl flex flex-col items-center">
                <div className="flex flex-col-reverse items-center gap-16 md:gap-24 w-full">
                    <RecursiveBranch node={data} isRoot />
                </div>
            </div>

            {/* Aesthetic Overlay Gradient */}
            <div className="pointer-events-none fixed inset-0 bg-gradient-to-t from-[#2a0005]/20 to-transparent" />
        </div>
    );
};

const RecursiveBranch: React.FC<{ node: RecursiveFamily; isRoot?: boolean }> = ({
    node,
    isRoot = false
}) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col-reverse items-center relative w-full">
            {/* Connections (SVG Lines) - Simplified for MVP */}
            {hasChildren && (
                <div className="absolute top-0 w-full h-px pointer-events-none" style={{ transform: 'translateY(-50%)' }}>
                    {/* We would render curved SVG paths here connecting node to node.children */}
                </div>
            )}

            {/* Node Itself */}
            <OrganicMemberNode
                name={node.name || "Unknown"}
                born={node.born}
                died={node.died}
                role={isRoot ? "Patriarch" : undefined}
                avatar={node.avatar}
                isPatriarch={isRoot}
                className="z-10"
            />

            {/* Children branches */}
            {hasChildren && (
                <div className="flex justify-center gap-8 md:gap-16 lg:gap-24 w-full mb-24 md:mb-32 relative">
                    {/* Connector to parent */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-24 bg-gradient-to-t from-amber-500/30 to-transparent"
                        style={{ transform: 'translateY(100%)' }} />

                    {node.children!.map((child) => (
                        <RecursiveBranch key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};
