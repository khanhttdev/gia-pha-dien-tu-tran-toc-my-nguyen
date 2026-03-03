import { create } from "zustand";
import {
    getFunds,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getFundBalance,
    getFundSummary,
    getTopContributors,
} from "@/lib/fund-actions";

// ─── State Machine ─────────────────────────────────────────────────────────────

export type FundStatus =
    | "idle"
    | "loading"
    | "ready"
    | "submitting"
    | "error";

interface FundSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    chartData: { month: string; income: number; expense: number }[];
}

interface TopContributor {
    id: string;
    name: string;
    amount: number;
}

interface FundState {
    // Machine state
    status: FundStatus;
    error: string | null;

    // Data
    transactions: any[];
    hasMore: boolean;
    nextCursor: string | undefined;
    balance: number;
    summary: FundSummary | null;
    topContributors: TopContributor[];

    // Actions (transitions)
    fetchFunds: () => Promise<void>;
    loadMore: () => Promise<void>;
    fetchDashboard: () => Promise<void>;
    addTransaction: (formData: FormData) => Promise<{ error?: string }>;
    updateTransaction: (id: string, formData: FormData) => Promise<{ error?: string }>;
    deleteTransaction: (id: string) => Promise<{ error?: string }>;
    reset: () => void;
}

export const useFundStore = create<FundState>((set, get) => ({
    status: "idle",
    error: null,
    transactions: [],
    hasMore: false,
    nextCursor: undefined,
    balance: 0,
    summary: null,
    topContributors: [],

    fetchFunds: async () => {
        set({ status: "loading", error: null });

        try {
            const res = await getFunds();

            if (res.error) {
                set({ status: "error", error: res.error });
                return;
            }

            set({
                status: "ready",
                transactions: res.data ?? [],
                hasMore: res.hasMore,
                nextCursor: res.nextCursor,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load funds";
            console.error("FundStore.fetchFunds:", message);
            set({ status: "error", error: message });
        }
    },

    loadMore: async () => {
        const { nextCursor, status } = get();
        if (status !== "ready" || !nextCursor) return;

        try {
            const res = await getFunds(nextCursor);

            if (res.error) {
                set({ error: res.error });
                return;
            }

            set((state) => ({
                transactions: [...state.transactions, ...(res.data ?? [])],
                hasMore: res.hasMore,
                nextCursor: res.nextCursor,
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load more";
            console.error("FundStore.loadMore:", message);
            set({ error: message });
        }
    },

    fetchDashboard: async () => {
        set({ status: "loading", error: null });

        try {
            const [sumRes, topRes, balRes] = await Promise.all([
                getFundSummary(),
                getTopContributors(5),
                getFundBalance(),
            ]);

            set({
                status: "ready",
                summary: sumRes.data as FundSummary | null,
                topContributors: (topRes.data as TopContributor[]) ?? [],
                balance: balRes.balance,
                error: sumRes.error || topRes.error || balRes.error || null,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load dashboard";
            console.error("FundStore.fetchDashboard:", message);
            set({ status: "error", error: message });
        }
    },

    addTransaction: async (formData) => {
        set({ status: "submitting", error: null });

        try {
            const res = await addTransaction(formData);

            if (res.error) {
                set({ status: "ready", error: res.error });
                return { error: res.error };
            }

            // Reload both transactions and dashboard after add
            await Promise.all([get().fetchFunds(), get().fetchDashboard()]);
            return {};
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to add transaction";
            console.error("FundStore.addTransaction:", message);
            set({ status: "ready", error: message });
            return { error: message };
        }
    },

    updateTransaction: async (id, formData) => {
        set({ status: "submitting", error: null });

        try {
            const res = await updateTransaction(id, formData);

            if (res.error) {
                set({ status: "ready", error: res.error });
                return { error: res.error };
            }

            await Promise.all([get().fetchFunds(), get().fetchDashboard()]);
            return {};
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update";
            console.error("FundStore.updateTransaction:", message);
            set({ status: "ready", error: message });
            return { error: message };
        }
    },

    deleteTransaction: async (id) => {
        // Optimistic removal
        set((state) => ({
            status: "submitting",
            transactions: state.transactions.filter((t: any) => t.id !== id),
        }));

        try {
            const res = await deleteTransaction(id);

            if (res.error) {
                // Rollback
                await get().fetchFunds();
                set({ status: "ready", error: res.error });
                return { error: res.error };
            }

            // Refresh dashboard data
            await get().fetchDashboard();
            set({ status: "ready" });
            return {};
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete";
            console.error("FundStore.deleteTransaction:", message);
            await get().fetchFunds();
            set({ status: "ready", error: message });
            return { error: message };
        }
    },

    reset: () => {
        set({
            status: "idle",
            error: null,
            transactions: [],
            hasMore: false,
            nextCursor: undefined,
            balance: 0,
            summary: null,
            topContributors: [],
        });
    },
}));
