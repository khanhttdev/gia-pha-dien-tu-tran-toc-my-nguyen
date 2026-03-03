import { describe, it, expect, beforeEach } from "vitest";
import { useTreeStore } from "@/lib/stores/tree-store";
import type { Member, Spouse } from "@/lib/types";

const mockMembers: Member[] = [
    {
        id: "m1",
        full_name: "Trần Văn A",
        gender: "male",
        generation_level: 1,
        birth_order: 1,
        father_id: null,
        mother_id: null,
        metadata: { birth_year: 1940 },
        created_at: null,
        updated_at: null,
    },
    {
        id: "m2",
        full_name: "Trần Văn B",
        gender: "male",
        generation_level: 2,
        birth_order: 1,
        father_id: "m1",
        mother_id: null,
        metadata: { birth_year: 1970 },
        created_at: null,
        updated_at: null,
    },
    {
        id: "m3",
        full_name: "Trần Thị C",
        gender: "female",
        generation_level: 2,
        birth_order: 2,
        father_id: "m1",
        mother_id: null,
        metadata: { birth_year: 1975 },
        created_at: null,
        updated_at: null,
    },
];

const mockSpouses: Spouse[] = [
    {
        id: "s1",
        full_name: "Nguyễn Thị X",
        member_id: "m1",
        role_type: "wife",
        status: "married",
        metadata: null,
        created_at: null,
        updated_at: null,
    },
];

describe("TreeStore", () => {
    beforeEach(() => {
        useTreeStore.setState({
            status: "idle",
            error: null,
            members: [],
            spouses: [],
            selectedMemberId: null,
            selectedMember: null,
            isModalOpen: false,
            searchQuery: "",
            searchResults: [],
        });
    });

    it("should have correct initial state", () => {
        const state = useTreeStore.getState();

        expect(state.status).toBe("idle");
        expect(state.members).toEqual([]);
        expect(state.spouses).toEqual([]);
        expect(state.selectedMemberId).toBeNull();
        expect(state.isModalOpen).toBe(false);
        expect(state.searchQuery).toBe("");
    });

    it("should hydrate tree from SSR data", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);

        const state = useTreeStore.getState();
        expect(state.status).toBe("ready");
        expect(state.members).toHaveLength(3);
        expect(state.spouses).toHaveLength(1);
        expect(state.error).toBeNull();
    });

    it("should select a member and open modal", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);
        useTreeStore.getState().selectMember(mockMembers[0]);

        const state = useTreeStore.getState();
        expect(state.selectedMemberId).toBe("m1");
        expect(state.selectedMember).toEqual(mockMembers[0]);
        expect(state.isModalOpen).toBe(true);
    });

    it("should close modal", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);
        useTreeStore.getState().selectMember(mockMembers[0]);
        useTreeStore.getState().closeModal();

        expect(useTreeStore.getState().isModalOpen).toBe(false);
        // selectedMember remains for animation purposes
    });

    it("should clear selection completely", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);
        useTreeStore.getState().selectMember(mockMembers[0]);
        useTreeStore.getState().clearSelection();

        const state = useTreeStore.getState();
        expect(state.selectedMemberId).toBeNull();
        expect(state.selectedMember).toBeNull();
        expect(state.isModalOpen).toBe(false);
    });

    it("should search members by name", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);
        useTreeStore.getState().setSearchQuery("Thị");

        const state = useTreeStore.getState();
        expect(state.searchQuery).toBe("Thị");
        expect(state.searchResults).toHaveLength(1);
        expect(state.searchResults[0].full_name).toBe("Trần Thị C");
    });

    it("should return all members on partial match", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);
        useTreeStore.getState().setSearchQuery("Trần");

        expect(useTreeStore.getState().searchResults).toHaveLength(3);
    });

    it("should return empty results for non-matching search", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);
        useTreeStore.getState().setSearchQuery("Nguyễn");

        expect(useTreeStore.getState().searchResults).toHaveLength(0);
    });

    it("should clear search", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);
        useTreeStore.getState().setSearchQuery("Trần");
        useTreeStore.getState().clearSearch();

        const state = useTreeStore.getState();
        expect(state.searchQuery).toBe("");
        expect(state.searchResults).toHaveLength(0);
    });

    it("should transition to editing state", () => {
        useTreeStore.getState().hydrateTree(mockMembers, mockSpouses);
        useTreeStore.getState().startEditing();

        expect(useTreeStore.getState().status).toBe("editing");
    });

    it("should not transition to editing from non-ready state", () => {
        // status is "idle" — should not transition
        useTreeStore.getState().startEditing();

        expect(useTreeStore.getState().status).toBe("idle");
    });
});
