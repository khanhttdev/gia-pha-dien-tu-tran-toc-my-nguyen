/* eslint-disable */
const fs = require('fs');
const crypto = require('crypto');

function uuidv4() {
    return crypto.randomUUID();
}

const maleFirst = ["Hùng", "Bình", "Dũng", "Tuấn", "Minh", "Khang", "An", "Bảo", "Đạt", "Phúc", "Thịnh", "Khoa", "Phát", "Vũ", "Long", "Thành", "Phương", "Hiếu", "Đức", "Trí", "Việt", "Anh", "Hoàng", "Sơn", "Hải", "Lâm", "Quân", "Phong", "Kiên", "Bách", "Nhân", "Nghiệp"];
const femaleFirst = ["Hoa", "Mai", "Lan", "Cúc", "Trúc", "Thủy", "Hương", "Trang", "Linh", "Nhung", "Yến", "Oanh", "Thảo", "My", "Vy", "Ngọc", "Châu", "Bích", "Thu", "Hà", "Ngân", "Phương", "Anh", "Hân", "Như", "Chi", "Diệp", "Uyên"];
const maleMid = ["Văn", "Minh", "Quốc", "Hữu", "Đình", "Xuân", "Ngọc", "Hoàng", "Đức", "Thái", "Gia", "Đình", "Trọng"];
const femaleMid = ["Thị", "Ngọc", "Thu", "Xuân", "Hoàng", "Bích", "Phương", "Thanh", "Bảo", "Kiều", "Cẩm"];
const lastNames = ["Nguyễn", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

let members = [];
let spouses = [];

// Create G1
let g1_male = {
    id: uuidv4(),
    full_name: "Trần Văn Cội",
    gender: 'male',
    generation_level: 1,
    father_id: null,
    mother_id: null,
    birth_order: 1,
    metadata: {
        birth_year: 1800,
        death_year: 1875,
        is_alive: false,
        notes: 'Thủy tổ dòng họ Trần tộc Mỹ Nguyên'
    }
};

let g1_female = {
    id: uuidv4(),
    member_id: g1_male.id,
    full_name: randItem(lastNames) + " " + randItem(femaleMid) + " " + randItem(femaleFirst),
    role_type: 'chinh_that',
    status: 'married',
    metadata: {
        birth_year: 1805,
        death_year: 1882,
        is_alive: false,
        notes: 'Phu nhân Thủy tổ'
    }
};

members.push(g1_male);
spouses.push(g1_female);

// Generate G2: 3 branches
let g2_males = [];
for (let i = 0; i < 3; i++) {
    let bYear = 1825 + i * 4;
    let person = {
        id: uuidv4(),
        full_name: "Trần " + randItem(maleMid) + " " + randItem(maleFirst),
        gender: 'male',
        generation_level: 2,
        father_id: g1_male.id,
        mother_id: g1_female.id,
        birth_order: i + 1,
        metadata: {
            birth_year: bYear,
            death_year: bYear + randInt(50, 80),
            is_alive: false,
            notes: `Tổ chi ${i + 1}`
        }
    };
    members.push(person);
    g2_males.push(person);
}

// Generations
let currentGenerationMales = g2_males;
let nextGenerationMales = [];

for (let gen = 3; gen <= 8; gen++) {
    nextGenerationMales = [];
    for (let father of currentGenerationMales) {

        // Spouse
        let wife = {
            id: uuidv4(),
            member_id: father.id,
            full_name: randItem(lastNames) + " " + randItem(femaleMid) + " " + randItem(femaleFirst),
            role_type: 'chinh_that',
            status: 'married',
            metadata: {
                birth_year: father.metadata.birth_year + randInt(-5, 5),
                death_year: father.metadata.birth_year + randInt(40, 80),
                is_alive: false
            }
        };
        spouses.push(wife);

        // Children
        let minChildren = gen <= 4 ? 3 : 2;
        let maxChildren = gen <= 4 ? 8 : (gen <= 5 ? 5 : 3);
        let numChildren = randInt(minChildren, maxChildren);

        for (let c = 0; c < numChildren; c++) {
            let isBoy = Math.random() > 0.45;
            let cBYear = father.metadata.birth_year + 20 + randInt(0, 15) + (c * 2);
            if (cBYear > 2026) continue;

            let child = {
                id: uuidv4(),
                full_name: "Trần " + (isBoy ? randItem(maleMid) + " " + randItem(maleFirst) : randItem(femaleMid) + " " + randItem(femaleFirst)),
                gender: isBoy ? 'male' : 'female',
                generation_level: gen,
                father_id: father.id,
                mother_id: wife.id,
                birth_order: c + 1,
                metadata: {
                    birth_year: cBYear,
                    death_year: cBYear + randInt(50, 90),
                    is_alive: false,
                    notes: ''
                }
            };
            members.push(child);
            if (isBoy) {
                nextGenerationMales.push(child);
            }
        }
    }
    currentGenerationMales = nextGenerationMales;
}

// Adjust livings for exactly 33 'nam đinh'
let allNamDinh = members.filter(p => p.gender === 'male');
allNamDinh.sort((a, b) => b.metadata.birth_year - a.metadata.birth_year);

let livingCount = 0;
for (let p of allNamDinh) {
    if (livingCount < 33 && p.metadata.birth_year > 1950) {
        p.metadata.is_alive = true;
        p.metadata.death_year = null;
        livingCount++;
    } else {
        p.metadata.is_alive = false;
        if (!p.metadata.death_year || p.metadata.death_year > 2026) {
            p.metadata.death_year = Math.min(2026, p.metadata.birth_year + randInt(0, 85));
            if (p.metadata.birth_year > 2010) p.metadata.death_year = 2026;
        }
    }
}

// Ensure living women and spouses
for (let p of members.filter(m => m.gender === 'female')) {
    if (p.metadata.birth_year > 1960 && Math.random() > 0.3) {
        p.metadata.is_alive = true;
        p.metadata.death_year = null;
    } else {
        p.metadata.is_alive = false;
        if (!p.metadata.death_year || p.metadata.death_year > 2026) p.metadata.death_year = Math.min(2026, p.metadata.birth_year + randInt(30, 85));
    }
}

for (let p of spouses) {
    if (p.metadata.birth_year > 1960 && Math.random() > 0.3) {
        p.metadata.is_alive = true;
        p.metadata.death_year = null;
    } else {
        p.metadata.is_alive = false;
        if (!p.metadata.death_year || p.metadata.death_year > 2026) p.metadata.death_year = Math.min(2026, p.metadata.birth_year + randInt(30, 85));
    }
}

console.log(`Generated ${members.length} members and ${spouses.length} spouses.`);
console.log(`Living nam đinh: ${members.filter(p => p.gender === 'male' && p.metadata.is_alive).length}`);

fs.writeFileSync('seed_data.json', JSON.stringify({ members, spouses }, null, 2));
