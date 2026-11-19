// poems.js - everything about poems: rules, saving, finding, and the "Saved" list.
//
// A poem is stored like this:
//   { id, authorId, title, language, text, createdAt }
// "Saved" is stored as an object:  { "<userId>": [poemId, poemId, ...] }

const MIN_WORDS = 80;

const Poems = {
    all() {
        return Store.read("poems", []);
    },

    byId(id) {
        return this.all().find((poem) => poem.id === id) || null;
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

    // Saves a new poem and returns it. Call validate() first.
    create(authorId, data) {
        const poems = this.all();
        const poem = {
            id: Store.nextId(poems),
            authorId: authorId,
            title: data.title.trim(),
            language: data.language,
            text: data.text.trim(),
            createdAt: Date.now(),
        };
        poems.push(poem);
        Store.write("poems", poems);
        return poem;
    },

    // Newest first. Pass "English" or "Hindi" to keep only that language.
    feed(language) {
        return this.all()
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

    // The poems this person has saved, newest saved first.
    saved(userId) {
        const ids = Store.read("saved", {})[userId] || [];
        return ids.map((id) => this.byId(id)).filter(Boolean);
    },

    isSaved(userId, poemId) {
        return (Store.read("saved", {})[userId] || []).includes(poemId);
    },

    // Saves the poem, or un-saves it if it was already saved.
    toggleSaved(userId, poemId) {
        const all = Store.read("saved", {});
        const ids = all[userId] || [];
        all[userId] = ids.includes(poemId)
            ? ids.filter((id) => id !== poemId)
            : [poemId].concat(ids);
        Store.write("saved", all);
    },
};
