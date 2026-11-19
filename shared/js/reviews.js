// reviews.js - reviews on a poem.
//
// A review is a proper response: at least 30 words, public, one per reader
// per poem, and never on your own poem. (The database enforces these rules too.)
// A review looks like this:  { id, poemId, authorId, text, createdAt }

const MIN_REVIEW_WORDS = 30;

const Reviews = {
    items: [], // every review, oldest first

    // Downloads all reviews.
    async load() {
        try {
            const { data, error } = await db
                .from("reviews")
                .select("id, poem_id, author_id, body, created_at")
                .order("created_at", { ascending: true });
            if (error) throw error;
            this.items = data.map((row) => this.fromRow(row));
        } catch (error) {
            this.items = [];
        }
    },

    // Turns a database row into the review shape used in the site.
    fromRow(row) {
        return {
            id: row.id,
            poemId: row.poem_id,
            authorId: row.author_id,
            text: row.body,
            createdAt: new Date(row.created_at).getTime(),
        };
    },

    forPoem(poemId) {
        return this.items.filter((review) => review.poemId === poemId);
    },

    // How many reviews this person has written.
    countBy(userId) {
        return this.items.filter((review) => review.authorId === userId).length;
    },

    // Has this reader already reviewed this poem?
    hasReviewed(poemId, userId) {
        return this.forPoem(poemId).some((review) => review.authorId === userId);
    },

    // Returns an error message, or "" when the review is allowed.
    check(poem, userId, text) {
        if (poem.authorId === userId) return "You cannot review your own poem.";
        if (this.hasReviewed(poem.id, userId)) return "You have already reviewed this poem.";
        const words = Utils.countWords(text);
        if (words < MIN_REVIEW_WORDS)
            return "A review needs at least " + MIN_REVIEW_WORDS + " words. You have " + words + ".";
        return "";
    },

    // Saves a review. Call check() first. Throws an Error with a friendly message if it fails.
    async add(poem, text) {
        const { data, error } = await db
            .from("reviews")
            .insert({ poem_id: poem.id, body: text.trim() })
            .select("id, poem_id, author_id, body, created_at")
            .single();
        if (error) {
            if (error.code === "23505") throw new Error("You have already reviewed this poem.");
            if (error.code === "42501") throw new Error("You cannot review your own poem.");
            throw new Error("Your review could not be posted. " + error.message);
        }
        const review = this.fromRow(data);
        this.items.push(review);
        return review;
    },
};
