// profile page: who you are, your numbers, your poems and your saved poems.

let user = null;

Layout.requireSignIn().then(function (found) {
    if (found) {
        user = found;
        start();
    }
});

// Loads everything, then draws the page.
async function start() {
    Layout.mount("profile");
    await Poems.load();
    await Poems.loadSaved();
    await Reviews.load();
    draw();
}

// Fills in the whole page.
function draw() {
    const mine = Poems.byAuthor(user.id);
    const saved = Poems.saved();

    document.getElementById("profile-initial").textContent = user.name.charAt(0).toUpperCase();
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-languages").textContent = "Writes in " + user.languages.join(" and ");
    document.getElementById("stat-poems").textContent = mine.length;
    document.getElementById("stat-reviews").textContent = Reviews.countBy(user.id);
    document.getElementById("stat-saved").textContent = saved.length;

    fillList("my-poems", mine, "You have not published a poem yet.");
    fillList("saved-poems", saved, "Poems you save appear here.");
}

// Puts a card for each poem into the box, or a short message when there are none.
function fillList(boxId, poems, emptyText) {
    const box = document.getElementById(boxId);
    box.innerHTML = "";
    if (poems.length === 0) {
        const none = document.createElement("p");
        none.className = "profile__empty";
        none.textContent = emptyText;
        box.append(none);
        return;
    }
    poems.forEach(function (poem) {
        box.append(PoemCard.render(poem, Auth.byId(poem.authorId), false, null));
    });
}

document.getElementById("sign-out").addEventListener("click", async function () {
    await Auth.signOut();
    window.location.href = "../sign-in/index.html";
});
