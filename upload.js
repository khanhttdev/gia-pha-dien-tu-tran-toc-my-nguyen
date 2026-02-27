const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// In a real environment, you would use environment variables safely
const sbUrl = 'YOUR_SUPABASE_URL';
const sbKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(sbUrl, sbKey);

async function upload() {
    const data = JSON.parse(fs.readFileSync('seed_data.json', 'utf8'));
    console.log(`Starting upload: ${data.members.length} members, ${data.spouses.length} spouses`);

    // Pass 1: Insert members without father_id/mother_id to avoid circular FK
    const chunkSize = 100;
    const membersPass1 = data.members.map(m => ({ ...m, father_id: null, mother_id: null }));

    for (let i = 0; i < membersPass1.length; i += chunkSize) {
        let chunk = membersPass1.slice(i, i + chunkSize);
        console.log(`[1/3] Uploading members (base) ${i} to ${i + chunk.length}...`);
        const { error } = await supabase.from('members').insert(chunk);
        if (error) {
            console.error(error);
            return;
        }
    }

    // Pass 2: Insert spouses
    for (let i = 0; i < data.spouses.length; i += chunkSize) {
        let chunk = data.spouses.slice(i, i + chunkSize);
        console.log(`[2/3] Uploading spouses ${i} to ${i + chunk.length}...`);
        const { error } = await supabase.from('spouses').insert(chunk);
        if (error) {
            console.error(error);
            return;
        }
    }

    // Pass 3: Upsert members to restore father_id and mother_id
    for (let i = 0; i < data.members.length; i += chunkSize) {
        let chunk = data.members.slice(i, i + chunkSize);
        console.log(`[3/3] Upserting members (relations) ${i} to ${i + chunk.length}...`);
        const { error } = await supabase.from('members').upsert(chunk);
        if (error) {
            console.error(error);
            return;
        }
    }

    console.log("Upload completed!");
}

upload();
