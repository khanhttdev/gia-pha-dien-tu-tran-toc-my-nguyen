import { create } from "zustand";
import {
    getAllMembers,
    getAllSpouses,
    updateMember,
    deleteMember,
} from "@/lib/supabase-data";
import type { Member, MemberUpdate, Spouse } from "@/lib/types";

// ─── State Machine ─────────────────────────────────────────────────────────────

export type TreeStatus =
    | "idle"
    | "loading"
    | "ready"
    | "editing"
    | "saving"
    | "error";

interface TreeState {
    // Machine state
    status: TreeStatus;
    error: string | null;

    // Data
    members: Member[];
    spouses: Spouse[];
    selectedMemberId: string | null;
    selectedMember: Member | null;
    isModalOpen: boolean;
    searchQuery: string;
    searchResults: Member[];

    // Actions (transitions)
    fetchTree: () => Promise<void>;
    hydrateTree: (members: Member[], spouses: Spouse[]) => void;
    selectMember: (member: Member) => void;
    clearSelection: () => void;
    closeModal: () => void;
    startEditing: () => void;
    saveEdit: (id: string, updates: MemberUpdate) => Promise<void>;
    removeMember: (id: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
    status: "idle",
    error: null,
    members: [],
    spouses: [],
    selectedMemberId: null,
    selectedMember: null,
    isModalOpen: false,
    searchQuery: "",
    searchResults: [],

    fetchTree: async () => {
        set({ status: "loading", error: null });

        try {
            const [members, spouses] = await Promise.all([
                getAllMembers(),
                getAllSpouses(),
            ]);

            set({ status: "ready", members, spouses });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load tree";
            console.error("TreeStore.fetchTree:", message);
            set({ status: "error", error: message });
        }
    },

    hydrateTree: (members, spouses) => {
        set({ status: "ready", members, spouses, error: null });
    },

    selectMember: (member) => {
        set({
            selectedMemberId: member.id,
            selectedMember: member,
            isModalOpen: true,
        });
    },

    clearSelection: () => {
        set({
            selectedMemberId: null,
            selectedMember: null,
            isModalOpen: false,
        });
    },

    closeModal: () => {
        set({ isModalOpen: false });
    },

    startEditing: () => {
        if (get().status === "ready") {
            set({ status: "editing" });
        }
    },

    saveEdit: async (id, updates) => {
        set({ status: "saving", error: null });

        try {
            const updated = await updateMember(id, updates);

            set((state) => ({
                status: "ready",
                members: state.members.map((m) => (m.id === id ? updated : m)),
                selectedMember: state.selectedMemberId === id ? updated : state.selectedMember,
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save";
            console.error("TreeStore.saveEdit:", message);
            set({ status: "error", error: message });
        }
    },

    removeMember: async (id) => {
        set({ status: "saving", error: null });

        try {
            await deleteMember(id);

            set((state) => ({
                status: "ready",
                members: state.members.filter((m) => m.id !== id),
                selectedMemberId: state.selectedMemberId === id ? null : state.selectedMemberId,
                selectedMember: state.selectedMemberId === id ? null : state.selectedMember,
                isModalOpen: state.selectedMemberId === id ? false : state.isModalOpen,
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete";
            console.error("TreeStore.removeMember:", message);
            set({ status: "error", error: message });
        }
    },

    setSearchQuery: (query) => {
        const { members } = get();
        const trimmed = query.trim().toLowerCase();

        const searchResults = trimmed
            ? members.filter((m) =>
                m.full_name.toLowerCase().includes(trimmed)
            )
            : [];

        set({ searchQuery: query, searchResults });
    },

    clearSearch: () => {
        set({ searchQuery: "", searchResults: [] });
    },
}));
