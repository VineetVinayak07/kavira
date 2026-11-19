// home page: the poem feed (filter by language), plus the "Saved" box you can drag poems into.

let user = null;

Layout.requireSignIn().then(function (found) {
    if (found) {
        user = found;
        start();
    }
});

// Sets up the page, loads the poems from the database, then draws everything.
async function start() {
    Layout.mount("home");
    document.getElementById("welcome").textContent = user.name.split(" ")[0];
    // Local Storage remembers which language filter you used last time.
    document.getElementById("language-filter").value = Store.read("language-filter", "");
    setUpDropBox();

    await Poems.load();
    await Poems.loadSaved();
    if (Poems.usingSamples) {
        showNotice("The database could not be reached, so these are sample poems. Saving will not work.");
    }
    drawAll();
}

// Shows a message above the feed.
function showNotice(text) {
    const notice = document.getElementById("feed-notice");
    notice.hidden = false;
    notice.textContent = text;
}

// Draws the feed and the saved list.
function drawAll() {
    showFeed();
    showSaved();
}

// Draws one card for every poem in the chosen language.
function showFeed() {
    const language = document.getElementById("language-filter").value;
    const feed = document.getElementById("feed");
    feed.innerHTML = "";
    const poems = Poems.feed(language);
    if (poems.length === 0) {
        const none = document.createElement("p");
        none.className = "notice";
        none.textContent = "No poems here yet. Be the first to share one.";
        feed.append(none);
        return;
    }
    poems.forEach(function (poem) {
        const author = Auth.byId(poem.authorId);
        if (author) feed.append(PoemCard.render(poem, author, Poems.isSaved(poem.id), saveFromButton));
    });
}

// Lists the saved poems as links in the side box.
function showSaved() {
    const list = document.getElementById("saved-list");
    list.innerHTML = "";
    Poems.saved().forEach(function (poem) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "../poem/index.html?id=" + poem.id;
        link.textContent = poem.title;
        item.append(link);
        list.append(item);
    });
}

// Saves or un-saves a poem, then redraws. Shows a message if the database refuses.
async function toggleAndRedraw(poemId) {
    try {
        await Poems.toggleSaved(poemId);
    } catch (error) {
        showNotice(error.message);
    }
    drawAll();
}

// The Save button on a card.
function saveFromButton(poem) {
    toggleAndRedraw(poem.id);
}

// Drag and Drop: dropping a poem card on the box saves it.
function setUpDropBox() {
    const box = document.getElementById("saved-box");
    box.addEventListener("dragover", function (event) {
        event.preventDefault(); // without this the browser does not allow a drop
        box.classList.add("saved--over");
    });
    box.addEventListener("dragleave", function () {
        box.classList.remove("saved--over");
    });
    box.addEventListener("drop", function (event) {
        event.preventDefault();
        box.classList.remove("saved--over");
        const id = Number(event.dataTransfer.getData("text/plain"));
        if (Poems.byId(id) && !Poems.isSaved(id)) toggleAndRedraw(id);
    });
}

document.getElementById("language-filter").addEventListener("change", function (event) {
    Store.write("language-filter", event.target.value);
    showFeed();
});
