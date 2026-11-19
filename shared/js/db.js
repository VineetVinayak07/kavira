// db.js - makes the one connection to Supabase that every other file uses (the name is `db`).
// It needs the Supabase library (loaded from a CDN in each page) and config.js before it.

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
