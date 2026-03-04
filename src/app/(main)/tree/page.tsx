import { OrganicTreeCanvas } from "@/components/tree/organic-tree-canvas";
import { RecursiveFamily } from "@/app/types/treeType";

// Mock data matching the design reference image
const familyData: RecursiveFamily = {
    id: "1",
    name: "Thomas Reid",
    born: "1928",
    avatar: "/assets/profile/patriarch.jpg", // Assuming assets exist or will be mocked
    children: [
        {
            id: "2",
            name: "Eleanor Finch",
            born: "1931",
            children: [
                {
                    id: "3",
                    name: "Arthur Reed",
                    born: "1956",
                    died: "2021",
                    children: [
                        {
                            id: "6",
                            name: "Margot Davis",
                            born: "1958",
                        },
                        {
                            id: "7",
                            name: "Oliver Reed",
                            born: "1984",
                        },
                        {
                            id: "8",
                            name: "Chloe Reed",
                            born: "2018",
                        }
                    ]
                },
                {
                    id: "4",
                    name: "Sarah Jenkins",
                    born: "1961",
                    children: [
                        {
                            id: "9",
                            name: "Clara Vance",
                            born: "1986",
                        },
                        {
                            id: "10",
                            name: "Julian Reed",
                            born: "1991",
                        },
                        {
                            id: "11",
                            name: "Chloe Reed",
                            born: "2018",
                        }
                    ]
                }
            ]
        }
    ]
};

export default function TreePage() {
    return (
        <main className="w-full h-full bg-zinc-950 overflow-hidden">
            <OrganicTreeCanvas data={familyData} />
        </main>
    );
}
