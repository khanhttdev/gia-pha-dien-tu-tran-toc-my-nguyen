import { createClient } from "@/lib/supabase-server";
import { FamilyTreeCanvas } from "@/components/tree/FamilyTreeCanvas";
import { FamilyTreeList } from "@/components/tree/FamilyTreeList";
import { Member, Spouse } from "@/lib/types";

export const metadata = {
    title: "Cây Gia Phả | Trần Tộc Mỹ Nguyên",
    description: "Cây gia phả trực quan của dòng họ Trần Tộc Mỹ Nguyên.",
};

export default async function TreePage() {
    const supabase = await createClient();

    // Fetch members
    const { data: membersData, error: membersError } = await supabase
        .from("members")
        .select("id, full_name, gender, generation_level, birth_order, father_id, mother_id, metadata")
        .order("generation_level", { ascending: true })
        .order("birth_order", { ascending: true });

    // Fetch spouses
    const { data: spousesData, error: spousesError } = await supabase
        .from("spouses")
        .select("*");

    const members: Member[] = membersError ? [] : (membersData as Member[]);
    const spouses: Spouse[] = spousesError ? [] : (spousesData as Spouse[]);

    return (
        <main className="w-full h-[calc(100dvh-64px)] relative flex bg-transparent">
            <div className="hidden lg:block w-full h-full relative">
                <FamilyTreeCanvas members={members} spouses={spouses} />
            </div>
            <div className="block lg:hidden w-full h-full relative">
                <FamilyTreeList members={members} spouses={spouses} />
            </div>
        </main>
    );
}
