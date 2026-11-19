// circle.js - a poet's circle: up to 5 other poets who write in the same language.
// The database picks the circle at random the first time (the function assign_circle in
// supabase/schema.sql) and keeps it, so everyone sees the same circle every time.

const CIRCLE_SIZE = 6; // including the poet themself

const Circle = {
    // Returns the circle's members as poets. Needs Poems.load() first (it loads the names).
    async members() {
        const { data, error } = await db.rpc("assign_circle");
        if (error) throw error;
        return data.map((id) => Auth.byId(id)).filter(Boolean);
    },

    // Poems written by the given members, newest first.
    poems(members) {
        const ids = members.map((member) => member.id);
        return Poems.feed().filter((poem) => ids.includes(poem.authorId));
    },
};
