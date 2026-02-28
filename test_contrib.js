require("dotenv").config({ path: "./.env.local" });
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

sb.from("contributions").select("*").order("created_at", { ascending: false }).limit(2).then(({ data, error }) => {
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
})
