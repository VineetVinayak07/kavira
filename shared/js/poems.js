// poems.js - everything about poems: rules, loading, saving, finding, and the "Saved" list.
//
// Poems live in the Supabase database. load() downloads them once per page into `items`,
// and the other functions (feed, byId, byAuthor) search that list.
// A poem looks like this:  { id, authorId, title, language, text, createdAt }

const MIN_WORDS = 80;

const Poems = {
    items: [], // every poem, newest first
    savedIds: [], // ids of the poems the signed-in poet saved
    usingSamples: false, // true when the database could not be reached and we show the sample file

    // Turns a database row into the poem shape used everywhere in the site.
    fromRow(row) {
        return {
            id: row.id,
            authorId: row.author_id,
            title: row.title,
            language: row.language,
            text: row.body,
            createdAt: new Date(row.created_at).getTime(),
        };
    },

    // Downloads all poems and all poets' names. If the database cannot be reached,
    // it falls back to the sample poems in data/poems.json (Fetch API + JSON).
    async load() {
        try {
            const { data: poets, error: poetError } = await db.from("profiles").select("id, name, languages");
            if (poetError) throw poetError;
            const { data, error } = await db
                .from("poems")
                .select("id, author_id, title, language, body, created_at")
                .order("created_at", { ascending: false });
            if (error) throw error;
            Auth.profiles = poets;
            this.items = data.map((row) => this.fromRow(row));
            this.usingSamples = false;
        } catch (error) {
            console.warn("Database not reachable, showing sample poems:", error);
            await this.loadSamples();
        }
    },

    // Reads the sample poems from the JSON file instead of the database.
    async loadSamples() {
        const response = await fetch("../../data/poems.json");
        const data = await response.json();
        Auth.profiles = data.poets.map((poet, index) => ({
            id: "sample-" + index,
            name: poet.name,
            languages: poet.languages,
        }));
        this.items = data.poems.map((poem, index) => ({
            id: index + 1,
            authorId: "sample-" + poem.poet,
            title: poem.title,
            language: poem.language,
            text: poem.text,
            createdAt: Date.now() - poem.hoursAgo * 3600 * 1000,
        }));
        this.usingSamples = true;
    },

    // Downloads the ids of the poems this poet saved.
    async loadSaved() {
        try {
            const { data, error } = await db.from("saved").select("poem_id");
            if (error) throw error;
            this.savedIds = data.map((row) => row.poem_id);
        } catch (error) {
            this.savedIds = [];
        }
    },

    byId(id) {
        return this.items.find((poem) => poem.id === id) || null;
    },

    // Checks a poem before it is saved. Returns an object of error messages.
    validate(data) {
        const errors = {};
        if (data.title.trim() === "") errors.title = "Give your poem a title.";
        const words = Utils.countWords(data.text);
        if (words < MIN_WORDS)
            errors.text = "A poem needs at least " + MIN_WORDS + " words. You have " + words + ".";
        return errors;
    },

    // Publishes a new poem and returns it. Call validate() first.
    // Throws an Error with a friendly message if it fails.
    async create(data) {
        const { data: row, error } = await db
            .from("poems")
            .insert({ title: data.title.trim(), language: data.language, body: data.text.trim() })
            .select("id, author_id, title, language, body, created_at")
            .single();
        if (error) throw new Error("Your poem could not be published. " + error.message);
        const poem = this.fromRow(row);
        this.items.unshift(poem);
        return poem;
    },

    // Newest first. Pass "English" or "Hindi" to keep only that language.
    feed(language) {
        return this.items
            .filter((poem) => !language || poem.language === language)
            .sort((a, b) => b.createdAt - a.createdAt);
    },

    byAuthor(authorId) {
        return this.feed().filter((poem) => poem.authorId === authorId);
    },

    // The first few lines, for showing on a card.
    excerpt(text, lineCount = 4) {
        return text
            .split("\n")
            .filter((line) => line.trim() !== "")
            .slice(0, lineCount)
            .join("\n");
    },

    // ---- saved poems ----

    // The poems this poet saved.
    saved() {
        return this.savedIds.map((id) => this.byId(id)).filter(Boolean);
    },

    isSaved(poemId) {
        return this.savedIds.includes(poemId);
    },

    // Saves the poem, or un-saves it if it was already saved.
    async toggleSaved(poemId) {
        if (this.isSaved(poemId)) {
            const { error } = await db.from("saved").delete().eq("poem_id", poemId);
            if (error) throw new Error("Could not update your saved poems.");
            this.savedIds = this.savedIds.filter((id) => id !== poemId);
        } else {
            const { error } = await db.from("saved").insert({ poem_id: poemId });
            if (error) throw new Error("Could not save the poem. " + error.message);
            this.savedIds.unshift(poemId);
        }
    },
};
