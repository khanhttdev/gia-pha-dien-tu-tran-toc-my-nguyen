require("dotenv").config({ path: "./.env.local" });
require("dotenv").config({ path: "./.env" }); // usually SUPABASE_SERVICE_ROLE_KEY is here or we can just fetch via API route
const fs = require("fs");

console.log(fs.readFileSync("./.env.local", "utf-8"));
