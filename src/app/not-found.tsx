import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 text-center">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-amber-600/5 blur-[120px]" />
      </div>

      {/* Falling leaf decoration */}
      <div className="relative z-10 mb-6">
        <div
          className="text-7xl sm:text-8xl animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          🍂
        </div>
      </div>

      {/* 404 number */}
      <h1 className="relative z-10 text-[120px] sm:text-[160px] font-serif font-black leading-none gold-text select-none tracking-tighter">
        404
      </h1>

      {/* Message */}
      <h2 className="relative z-10 text-2xl sm:text-3xl font-serif font-bold text-foreground mt-2 mb-3">
        Trang này không tồn tại trong gia phả
      </h2>
      <p className="relative z-10 text-muted-foreground text-base sm:text-lg max-w-md leading-relaxed mb-10">
        Có vẻ bạn đã lạc đường. Hãy quay về nơi quen thuộc để tiếp tục khám phá
        dòng họ.
      </p>

      {/* Action buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-gradient text-amber-950 font-bold text-sm shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Về Trang Chủ
        </Link>
        <Link
          href="/tree"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass text-foreground font-semibold text-sm hover:bg-white/10 transition-all border border-border/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="6" x2="6" y1="3" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          Cây Gia Phả
        </Link>
      </div>

      {/* Heritage pattern bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />
    </div>
  );
}
