// my circle page: shows the poets in your circle and the poems they have written.

const user = Layout.requireSignIn();

if (user) {
    Layout.mount("circle");
    Seed.load()
        .then(draw)
        .catch(function () {
            draw();
            const notice = document.getElementById("feed-notice");
            notice.hidden = false;
            notice.textContent =
                "The starter poets could not load. Open the site with VS Code Live Server (see README).";
        });
}

// Draws the list of poets, then their poems.
function draw() {
    const members = Circle.members(user);
    const list = document.getElementById("circle-list");
    list.innerHTML = "";
    members.forEach(function (member) {
        const item = document.createElement("li");
        const initial = document.createElement("span");
        initial.className = "avatar";
        initial.textContent = member.name.charAt(0).toUpperCase();
        initial.setAttribute("aria-hidden", "true");
        const text = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = member.name;
        const languages = document.createElement("small");
        languages.textContent = member.languages.join(", ");
        text.append(name, languages);
        item.append(initial, text);
        list.append(item);
    });

    const feed = document.getElementById("feed");
    feed.innerHTML = "";
    const poems = Circle.poems(user);
    if (members.length === 0 || poems.length === 0) {
        const none = document.createElement("p");
        none.className = "notice";
        none.textContent =
            members.length === 0
                ? "No poets share your language yet. Your circle fills up as more poets join."
                : "Nobody in your circle has posted yet.";
        none.style.margin = "24px 32px";
        feed.append(none);
        return;
    }
    poems.forEach(function (poem) {
        feed.append(
            PoemCard.render(
                poem,
                Auth.byId(poem.authorId),
                Poems.isSaved(user.id, poem.id),
                function (p) {
                    Poems.toggleSaved(user.id, p.id);
                    draw();
                },
            ),
        );
    });
}
