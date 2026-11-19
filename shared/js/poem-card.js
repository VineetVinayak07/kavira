// poem-card.js - builds the card that shows one poem in a list (Home, My circle, Profile).
// Cards can be dragged into the "Saved" box on Home, and have a Save button for people who
// cannot drag (phones, keyboards). Text is added with textContent, so a poem can never inject HTML.

const PoemCard = {
    // poem: the poem. author: who wrote it. isSaved: true/false.
    // onSave: called with the poem when the Save button is pressed (leave out to hide the button).
    render(poem, author, isSaved, onSave) {
        const card = document.createElement("article");
        card.className = "poem-card";
        const lang = poem.language === "Hindi" ? "hi" : "en";

        const top = document.createElement("div");
        top.className = "poem-card__author";
        const initial = document.createElement("span");
        initial.className = "avatar";
        initial.textContent = author.name.charAt(0).toUpperCase();
        initial.setAttribute("aria-hidden", "true");
        const name = document.createElement("strong");
        name.textContent = author.name;
        const meta = document.createElement("span");
        meta.className = "poem-card__meta";
        meta.textContent = poem.language + " · " + Utils.timeAgo(poem.createdAt);
        top.append(initial, name, meta);

        const title = document.createElement("h2");
        title.className = "poem-card__title";
        title.lang = lang;
        const titleLink = document.createElement("a");
        titleLink.href = "../poem/index.html?id=" + poem.id;
        titleLink.textContent = poem.title;
        title.append(titleLink);

        const excerpt = document.createElement("p");
        excerpt.className = "poem-card__excerpt";
        excerpt.lang = lang;
        excerpt.textContent = Poems.excerpt(poem.text);

        const foot = document.createElement("div");
        foot.className = "poem-card__foot";
        const words = document.createElement("span");
        words.textContent = Utils.countWords(poem.text) + " words";
        foot.append(words);

        if (onSave) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn--small";
            button.textContent = isSaved ? "Saved" : "Save";
            button.setAttribute("aria-pressed", isSaved);
            button.addEventListener("click", function () {
                onSave(poem);
            });
            foot.append(button);

            // Drag and Drop: the card carries the poem's id to the drop box.
            card.draggable = true;
            card.addEventListener("dragstart", function (event) {
                event.dataTransfer.setData("text/plain", String(poem.id));
                event.dataTransfer.effectAllowed = "copy";
            });
        }

        card.append(top, title, excerpt, foot);
        return card;
    },
};
