// my circle page: shows the poets in your circle and the poems they have written.

let user = null;

Layout.requireSignIn().then(function (found) {
    if (found) {
        user = found;
        start();
    }
});

// Loads everything, asks the database for your circle, then draws the page.
async function start() {
    Layout.mount("circle");
    await Poems.load();
    await Poems.loadSaved();
    let members = [];
    try {
        members = await Circle.members();
    } catch (error) {
        const notice = document.getElementById("feed-notice");
        notice.hidden = false;
        notice.textContent = "Your circle could not be loaded. Check your internet and refresh.";
    }
    draw(members);
}

// Draws the list of poets, then their poems.
function draw(members) {
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
    const poems = Circle.poems(members);
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
            PoemCard.render(poem, Auth.byId(poem.authorId), Poems.isSaved(poem.id), async function (p) {
                try {
                    await Poems.toggleSaved(p.id);
                } catch (error) {}
                draw(members);
            }),
        );
    });
}
