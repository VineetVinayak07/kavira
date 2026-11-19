// profile page: who you are, your numbers, your poems and your saved poems.

const user = Layout.requireSignIn();

if (user) {
    Layout.mount("profile");
    Seed.load()
        .catch(function () {})
        .then(draw);
}

// Fills in the whole page.
function draw() {
    const mine = Poems.byAuthor(user.id);
    const saved = Poems.saved(user.id);

    document.getElementById("profile-initial").textContent = user.name.charAt(0).toUpperCase();
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-languages").textContent =
        "Writes in " + user.languages.join(" and ");
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

document.getElementById("sign-out").addEventListener("click", function () {
    Auth.signOut();
    window.location.href = "../sign-in/index.html";
});
