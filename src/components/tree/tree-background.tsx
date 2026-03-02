import Image from "next/image";

export function TreeBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <Image
                src="/images/tree-bg.png"
                alt="Family Tree Background"
                fill
                priority
                className="object-cover opacity-60 mix-blend-luminosity brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1b0505]/80 via-transparent to-[#1b0505]/90" />
            <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,#1b0505_100%) opacity-40" />
        </div>
    );
}
