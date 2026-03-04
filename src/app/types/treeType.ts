export interface TreeMemberData {
    id: string;
    level: number;
    posX: number;
    posY: number;
    name: string;
    detailsList: string[]; // e.g. ["Patriarch", "b. 1928"] 
    imageUrl: string | null;
}

export type RecursiveFamily = {
    id: string;
    name?: string;
    born?: string;
    died?: string;
    avatar?: string;
    children?: RecursiveFamily[];
};
