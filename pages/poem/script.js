// poem page: shows one poem (its id is in the web address) and its reviews.

let user = null;
let poem = null;

Layout.requireSignIn().then(function (found) {
    if (found) {
        user = found;
        start();
    }
});

// Loads the poem, the reviews and your saved list, then draws the page.
async function start() {
    Layout.mount("home");
    await Poems.load();
    await Poems.loadSaved();
    await Reviews.load();
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    poem = Poems.byId(id);
    if (poem) {
        showPoem();
        showReviews();
    } else {
        document.getElementById("poem-missing").hidden = false;
    }
}

// Fills in the poem itself. Everything goes in with textContent, never as HTML.
function showPoem() {
    const author = Auth.byId(poem.authorId);
    const lang = poem.language === "Hindi" ? "hi" : "en";
    document.title = "Kavira - " + poem.title;
    document.getElementById("poem").hidden = false;
    document.getElementById("poem-title").textContent = poem.title;
    document.getElementById("poem-title").lang = lang;
    document.getElementById("poem-author").textContent = author ? author.name : "Unknown poet";
    document.getElementById("poem-meta").textContent = poem.language + " · " + Utils.fullDate(poem.createdAt);
    const text = document.getElementById("poem-text");
    text.textContent = poem.text;
    text.lang = lang;
    showSaveButton();
}

// The Save / Saved button under the poem.
function showSaveButton() {
    const button = document.getElementById("save-button");
    const saved = Poems.isSaved(poem.id);
    button.textContent = saved ? "Saved" : "Save this poem";
    button.setAttribute("aria-pressed", saved);
}

document.getElementById("save-button").addEventListener("click", async function () {
    try {
        await Poems.toggleSaved(poem.id);
    } catch (error) {
        document.getElementById("review-note").hidden = false;
        document.getElementById("review-note").textContent = error.message;
    }
    showSaveButton();
});

// ---- reviews ----

// Draws the review form (or a note instead of it) and the list of reviews.
function showReviews() {
    document.getElementById("reviews-section").hidden = false;
    const mine = poem.authorId === user.id;
    const note = document.getElementById("review-note");

    // The poet cannot review their own poem, and nobody can review twice.
    if (mine || Reviews.hasReviewed(poem.id, user.id)) {
        document.getElementById("review-form").hidden = true;
        note.hidden = false;
        note.textContent = mine
            ? "Readers' reviews will appear here."
            : "You have reviewed this poem. Thank you.";
    }

    const list = document.getElementById("review-list");
    list.innerHTML = "";
    const reviews = Reviews.forPoem(poem.id);
    if (reviews.length === 0) {
        const none = document.createElement("p");
        none.className = "field__hint";
        none.textContent = "No reviews yet.";
        list.append(none);
    }
    reviews.forEach(function (review) {
        list.append(reviewBox(review));
    });
}

// One review: who wrote it, when, and the text.
function reviewBox(review) {
    const box = document.createElement("blockquote");
    box.className = "review";
    const who = document.createElement("div");
    who.className = "review__who";
    const name = document.createElement("strong");
    const author = Auth.byId(review.authorId);
    name.textContent = author ? author.name : "Unknown poet";
    const when = document.createElement("span");
    when.textContent = Utils.timeAgo(review.createdAt);
    who.append(name, when);
    const body = document.createElement("p");
    body.className = "review__text";
    body.textContent = review.text;
    box.append(who, body);
    return box;
}

Utils.watchWordCount(
    document.getElementById("review-text"),
    document.getElementById("review-count"),
    MIN_REVIEW_WORDS,
);

document.getElementById("review-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const text = document.getElementById("review-text").value;
    const problem = Reviews.check(poem, user.id, text);
    document.getElementById("review-error").textContent = problem;
    if (problem) return;
    const button = document.querySelector("#review-form button[type=submit]");
    button.disabled = true;
    try {
        await Reviews.add(poem, text);
        document.getElementById("review-text").value = "";
        showReviews();
    } catch (error) {
        document.getElementById("review-error").textContent = error.message;
    }
    button.disabled = false;
});
