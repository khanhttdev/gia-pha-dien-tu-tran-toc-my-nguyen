import { describe, it, expect, beforeEach } from "vitest";
import { useBoardStore } from "@/lib/stores/board-store";

describe("BoardStore", () => {
    beforeEach(() => {
        useBoardStore.setState({
            status: "idle",
            error: null,
            feedItems: [],
            currentPage: 0,
            hasMore: false,
            expandedComments: {},
        });
    });

    it("should have correct initial state", () => {
        const state = useBoardStore.getState();

        expect(state.status).toBe("idle");
        expect(state.feedItems).toEqual([]);
        expect(state.currentPage).toBe(0);
        expect(state.hasMore).toBe(false);
        expect(state.expandedComments).toEqual({});
        expect(state.error).toBeNull();
    });

    it("should toggle comments for a post", () => {
        useBoardStore.getState().toggleComments("post-1");
        expect(useBoardStore.getState().expandedComments["post-1"]).toBe(true);

        useBoardStore.getState().toggleComments("post-1");
        expect(useBoardStore.getState().expandedComments["post-1"]).toBe(false);
    });

    it("should toggle comments independently per post", () => {
        useBoardStore.getState().toggleComments("post-1");
        useBoardStore.getState().toggleComments("post-2");

        const { expandedComments } = useBoardStore.getState();
        expect(expandedComments["post-1"]).toBe(true);
        expect(expandedComments["post-2"]).toBe(true);

        useBoardStore.getState().toggleComments("post-1");
        expect(useBoardStore.getState().expandedComments["post-1"]).toBe(false);
        expect(useBoardStore.getState().expandedComments["post-2"]).toBe(true);
    });

    it("should reset all state", () => {
        useBoardStore.setState({
            status: "loaded",
            feedItems: [{ id: "1" } as any],
            currentPage: 3,
            hasMore: true,
            expandedComments: { "1": true },
            error: "some error",
        });

        useBoardStore.getState().reset();

        const state = useBoardStore.getState();
        expect(state.status).toBe("idle");
        expect(state.feedItems).toEqual([]);
        expect(state.currentPage).toBe(0);
        expect(state.hasMore).toBe(false);
        expect(state.expandedComments).toEqual({});
    });

    it("should not load more when status is not loaded", () => {
        // status is "idle" — loadMore should not proceed
        useBoardStore.getState().loadMore();
        expect(useBoardStore.getState().status).toBe("idle");
    });
});
