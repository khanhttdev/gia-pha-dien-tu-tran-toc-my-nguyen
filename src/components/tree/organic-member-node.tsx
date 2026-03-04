"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OrganicMemberNodeProps {
    name: string;
    born?: string;
    died?: string;
    role?: string;
    avatar?: string;
    className?: string;
    isPatriarch?: boolean;
}

export const OrganicMemberNode: React.FC<OrganicMemberNodeProps> = ({
    name,
    born,
    died,
    role,
    avatar,
    className,
    isPatriarch = false,
}) => {
    return (
        <div className={cn("flex flex-col items-center gap-2 group", className)}>
            {/* Golden Leaf Frame */}
            <div className="relative">
                {/* Glow Effect */}
                <div
                    className={cn(
                        "absolute inset-0 bg-amber-500/20 blur-xl rounded-full transition-opacity duration-500",
                        "group-hover:opacity-100 opacity-0"
                    )}
                />

                {/* The Leaf Frame: Rotated 45deg box with two rounded corners */}
                <div
                    className={cn(
                        "relative w-20 h-20 md:w-24 md:h-24 bg-zinc-950 border-2 border-amber-500/50",
                        "rounded-tr-[70%] rounded-bl-[70%] rotate-45 flex items-center justify-center overflow-hidden transition-all duration-300",
                        "group-hover:border-amber-400 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]",
                        isPatriarch && "w-24 h-24 md:w-28 md:h-28 border-amber-400 border-4 shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                    )}
                >
                    {/* Inner Content - Counter Rotated */}
                    <div className="-rotate-45 w-full h-full relative p-1">
                        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border border-amber-500/20">
                            {avatar ? (
                                <Image
                                    src={avatar}
                                    alt={name}
                                    width={112}
                                    height={112}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-amber-500/50">
                                    <span className="text-2xl font-serif">
                                        {name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Info */}
            <div className="text-center">
                <h3 className={cn(
                    "text-amber-100 font-serif text-sm md:text-base leading-tight tracking-wide",
                    isPatriarch && "text-amber-400 text-lg font-bold"
                )}>
                    {name}
                </h3>
                {role && (
                    <p className="text-amber-500/80 text-[10px] md:text-xs uppercase tracking-widest mt-0.5">
                        {role}
                    </p>
                )}
                <p className="text-amber-500/60 text-[10px] md:text-xs font-light mt-0.5">
                    {born && `b. ${born}`}
                    {died && ` \u2022 d. ${died}`}
                </p>
            </div>
        </div>
    );
};
