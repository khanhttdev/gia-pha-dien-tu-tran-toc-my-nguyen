import { Member } from "./types";

/**
 * Phân tích mối quan hệ giữa 2 thành viên
 * @param person1 Thành viên 1
 * @param person2 Thành viên 2
 * @returns Chuỗi mô tả quan hệ và cách xưng hô
 */
export function analyzeRelationship(person1: Member, person2: Member): string {
    if (person1.id === person2.id) return "Đây chính là cùng một người.";

    const genDiff = person1.generation_level - person2.generation_level;

    if (genDiff === 0) {
        // Cùng thế hệ
        if (person1.father_id === person2.father_id) {
            return person1.birth_order! < person2.birth_order!
                ? "Anh/Chị ruột"
                : "Em ruột";
        }
        return "Anh em họ (cùng thế hệ)";
    }

    if (genDiff === 1) {
        return person1.father_id === person2.id ? "Con của người này" : "Cháu (gọi bằng Chú/Bác/Cô/Dì)";
    }

    if (genDiff === -1) {
        return person2.father_id === person1.id ? "Cha của người này" : "Chú/Bác/Cô/Dì (gọi bằng Cháu)";
    }

    if (genDiff === 2) return "Cháu nội/ngoại";
    if (genDiff === -2) return "Ông/Bà nội/ngoại";

    if (genDiff > 2) return `Chắt/Chút đời sau (cách ${genDiff} đời)`;
    if (genDiff < -2) return `Cụ/Kỵ tiền nhân (cách ${Math.abs(genDiff)} đời)`;

    return "Họ hàng xa";
}
