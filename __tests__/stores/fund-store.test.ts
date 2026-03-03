import { describe, it, expect, beforeEach } from "vitest";
import { useFundStore } from "@/lib/stores/fund-store";

describe("FundStore", () => {
    beforeEach(() => {
        useFundStore.setState({
            status: "idle",
            error: null,
            transactions: [],
            hasMore: false,
            nextCursor: undefined,
            balance: 0,
            summary: null,
            topContributors: [],
        });
    });

    it("should have correct initial state", () => {
        const state = useFundStore.getState();

        expect(state.status).toBe("idle");
        expect(state.transactions).toEqual([]);
        expect(state.balance).toBe(0);
        expect(state.summary).toBeNull();
        expect(state.topContributors).toEqual([]);
        expect(state.hasMore).toBe(false);
        expect(state.nextCursor).toBeUndefined();
        expect(state.error).toBeNull();
    });

    it("should not load more when status is not ready", () => {
        // status is "idle" — should not load more
        useFundStore.getState().loadMore();
        expect(useFundStore.getState().status).toBe("idle");
    });

    it("should not load more without cursor", () => {
        useFundStore.setState({ status: "ready", nextCursor: undefined });
        useFundStore.getState().loadMore();
        expect(useFundStore.getState().status).toBe("ready");
    });

    it("should reset all state", () => {
        useFundStore.setState({
            status: "ready",
            transactions: [{ id: "1" }],
            balance: 1000000,
            summary: { totalIncome: 1000000, totalExpense: 0, balance: 1000000, chartData: [] },
            topContributors: [{ id: "m1", name: "Trần Văn A", amount: 500000 }],
            hasMore: true,
            nextCursor: "2024-01-01",
            error: null,
        });

        useFundStore.getState().reset();

        const state = useFundStore.getState();
        expect(state.status).toBe("idle");
        expect(state.transactions).toEqual([]);
        expect(state.balance).toBe(0);
        expect(state.summary).toBeNull();
        expect(state.topContributors).toEqual([]);
        expect(state.hasMore).toBe(false);
        expect(state.nextCursor).toBeUndefined();
    });
});
