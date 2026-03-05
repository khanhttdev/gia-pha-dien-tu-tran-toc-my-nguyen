import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-label="card"
      data-slot="card"
      className={cn(
        "relative bg-royal-card text-card-foreground flex flex-col gap-6 rounded-2xl border-[1.5px] border-heritage-gold/20 py-6 overflow-hidden transition-all duration-500 hover:border-heritage-gold/50 group",
        className,
      )}
      {...props}
    >
      {/* Gloss Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-20" />

      {/* Ornamental SVG Corners */}
      <svg className="absolute top-2 left-2 w-8 h-8 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
        <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
      </svg>
      <svg className="absolute top-2 right-2 w-8 h-8 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-500 pointer-events-none rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
        <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
      </svg>
      <svg className="absolute bottom-2 left-2 w-8 h-8 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-500 pointer-events-none -rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
        <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
      </svg>
      <svg className="absolute bottom-2 right-2 w-8 h-8 text-heritage-gold/20 group-hover:text-heritage-gold/40 transition-colors duration-500 pointer-events-none rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M2,12 C2,6.48 6.48,2 12,2" strokeLinecap="round" />
        <path d="M4,10 C4,6.69 6.69,4 10,4" strokeLinecap="round" strokeDasharray="1 2" />
      </svg>

      {props.children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header relative z-10 grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-8 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-serif text-2xl font-bold royal-text-gradient leading-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-heritage-gold-dim/70 text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("relative z-10 px-8", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("relative z-10 flex items-center px-8 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
