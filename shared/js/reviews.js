// reviews.js - reviews on a poem.
//
// A review is a proper response: at least 30 words, public, one per reader
// per poem, and never on your own poem.
// Stored like this: { id, poemId, authorId, text, createdAt }

const MIN_REVIEW_WORDS = 30;

const Reviews = {
    all() {
        return Store.read("reviews", []);
    },

    forPoem(poemId) {
        return this.all()
            .filter((review) => review.poemId === poemId)
            .sort((a, b) => a.createdAt - b.createdAt);
    },

    // How many reviews this person has written.
    countBy(userId) {
        return this.all().filter((review) => review.authorId === userId).length;
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
            return (
                "A review needs at least " + MIN_REVIEW_WORDS + " words. You have " + words + "."
            );
        return "";
    },

    // Saves a review. Call check() first.
    add(poem, userId, text) {
        const reviews = this.all();
        const review = {
            id: Store.nextId(reviews),
            poemId: poem.id,
            authorId: userId,
            text: text.trim(),
            createdAt: Date.now(),
        };
        reviews.push(review);
        Store.write("reviews", reviews);
        return review;
    },
};
