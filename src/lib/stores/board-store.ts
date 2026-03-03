import { create } from "zustand";
import {
    getBoardFeed,
    submitContribution,
    deleteContribution,
} from "@/lib/board-actions";
import { BOARD_TYPES } from "@/lib/constants";
import type { BoardFeedItem } from "@/lib/types";

// ─── State Machine ─────────────────────────────────────────────────────────────

export type BoardStatus =
    | "idle"
    | "loading"
    | "loaded"
    | "submitting"
    | "loading_more"
    | "error";

interface BoardState {
    // Machine state
    status: BoardStatus;
    error: string | null;

    // Data
    feedItems: BoardFeedItem[];
    currentPage: number;
    hasMore: boolean;

    // Form state
    expandedComments: Record<string, boolean>;

    // Actions (transitions)
    fetchFeed: () => Promise<void>;
    loadMore: () => Promise<void>;
    submitPost: (formData: FormData) => Promise<{ error?: string }>;
    deletePost: (id: string) => Promise<{ error?: string }>;
    toggleComments: (postId: string) => void;
    reset: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
    status: "idle",
    error: null,
    feedItems: [],
    currentPage: 0,
    hasMore: false,
    expandedComments: {},

    fetchFeed: async () => {
        set({ status: "loading", error: null, currentPage: 0 });

        try {
            const res = await getBoardFeed(0, 20);

            if (res.error) {
                set({ status: "error", error: res.error });
                return;
            }

            const { items, hasMore } = res.data!;
            set({ status: "loaded", feedItems: items, hasMore });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load feed";
            console.error("BoardStore.fetchFeed:", message);
            set({ status: "error", error: message });
        }
    },

    loadMore: async () => {
        const { currentPage, status } = get();
        if (status !== "loaded") return;

        const nextPage = currentPage + 1;
        set({ status: "loading_more" });

        try {
            const res = await getBoardFeed(nextPage, 20);

            if (res.error) {
                set({ status: "loaded", error: res.error });
                return;
            }

            const { items, hasMore } = res.data!;
            set((state) => ({
                status: "loaded",
                feedItems: [...state.feedItems, ...items],
                currentPage: nextPage,
                hasMore,
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load more";
            console.error("BoardStore.loadMore:", message);
            set({ status: "loaded", error: message });
        }
    },

    submitPost: async (formData) => {
        const prevStatus = get().status;
        set({ status: "submitting", error: null });

        try {
            const res = await submitContribution(formData);

            if (res.error) {
                set({ status: prevStatus === "idle" ? "idle" : "loaded", error: res.error });
                return { error: res.error };
            }

            // Reload feed after successful submit
            await get().fetchFeed();
            return {};
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to submit";
            console.error("BoardStore.submitPost:", message);
            set({ status: "loaded", error: message });
            return { error: message };
        }
    },

    deletePost: async (id) => {
        // Optimistic UI: remove immediately
        set((state) => ({
            feedItems: state.feedItems.filter((item) => item.id !== id),
        }));

        try {
            const res = await deleteContribution(id);

            if (res.error) {
                // Rollback: re-fetch on error
                await get().fetchFeed();
                return { error: res.error };
            }

            return {};
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete";
            console.error("BoardStore.deletePost:", message);
            await get().fetchFeed();
            return { error: message };
        }
    },

    toggleComments: (postId) => {
        set((state) => ({
            expandedComments: {
                ...state.expandedComments,
                [postId]: !state.expandedComments[postId],
            },
        }));
    },

    reset: () => {
        set({
            status: "idle",
            error: null,
            feedItems: [],
            currentPage: 0,
            hasMore: false,
            expandedComments: {},
        });
    },
}));
