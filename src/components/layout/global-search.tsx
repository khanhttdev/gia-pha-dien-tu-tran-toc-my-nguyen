"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Users,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react";

// Custom hook to debounce value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }
    let active = true;
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
        );
        const data = await res.json();
        if (active) setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSearch();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };

  const members = results.filter(
    (r) => r.type === "member" || r.type === "spouse",
  );
  const others = results.filter(
    (r) => r.type === "event" || r.type === "board",
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors w-full max-w-[240px]"
      >
        <Search className="w-4 h-4 text-amber-500" />
        <span>Tìm kiếm toàn cục...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-black/20 px-1.5 font-mono text-[10px] font-medium opacity-100 ml-auto">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Mobile search icon */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors p-2"
      >
        <Search className="w-5 h-5 text-amber-500" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Tìm tên thành viên, sự kiện, nội dung bài đăng..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : query.length > 0 ? (
              "Không tìm thấy kết quả nào"
            ) : (
              "Gõ phím để bắt đầu tìm kiếm..."
            )}
          </CommandEmpty>

          {members.length > 0 && (
            <CommandGroup heading="Nhân khẩu (Tộc viên & Phối ngẫu)">
              {members.map((res) => (
                <CommandItem
                  key={`${res.type}-${res.id}`}
                  onSelect={() => handleSelect(res.url)}
                  className="flex items-center gap-3 cursor-pointer py-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${res.type === "member" ? "bg-amber-500/10 text-amber-500" : "bg-pink-500/10 text-pink-500"}`}
                  >
                    {res.type === "member" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{res.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {res.subtitle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {others.length > 0 && (
            <CommandGroup heading="Hoạt động & Bảng tin">
              {others.map((res) => (
                <CommandItem
                  key={`${res.type}-${res.id}`}
                  onSelect={() => handleSelect(res.url)}
                  className="flex items-center gap-3 cursor-pointer py-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${res.type === "event" ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"}`}
                  >
                    {res.type === "event" ? (
                      <Calendar className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden max-w-[300px] sm:max-w-md">
                    <span className="font-semibold text-sm truncate">
                      {res.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {res.subtitle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
