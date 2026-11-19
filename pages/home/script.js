// home page: the poem feed (filter by language), plus the "Saved" box you can drag poems into.

const user = Layout.requireSignIn();

if (user) {
    Layout.mount("home");
    document.getElementById("welcome").textContent = user.name.split(" ")[0];
    setUpDropBox();
    // Load the starter poems the first time, then draw the page.
    Seed.load()
        .then(drawAll)
        .catch(function (error) {
            console.error(error);
            drawAll();
            const notice = document.getElementById("feed-notice");
            notice.hidden = false;
            notice.textContent =
                "The starter poems could not load. Open the site with VS Code Live Server (see README), not by double-clicking the file.";
        });
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
        if (author)
            feed.append(
                PoemCard.render(poem, author, Poems.isSaved(user.id, poem.id), saveFromButton),
            );
    });
}

// Lists the saved poems as links in the side box.
function showSaved() {
    const list = document.getElementById("saved-list");
    list.innerHTML = "";
    Poems.saved(user.id).forEach(function (poem) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "../poem/index.html?id=" + poem.id;
        link.textContent = poem.title;
        item.append(link);
        list.append(item);
    });
}

// The Save button on a card saves or un-saves that poem.
function saveFromButton(poem) {
    Poems.toggleSaved(user.id, poem.id);
    drawAll();
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
        if (Poems.byId(id) && !Poems.isSaved(user.id, id)) Poems.toggleSaved(user.id, id);
        drawAll();
    });
}

document.getElementById("language-filter").addEventListener("change", showFeed);
