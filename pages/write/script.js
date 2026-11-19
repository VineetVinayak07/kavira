// write page: write a poem, watch the word count, and publish it.
// The unfinished poem is kept in Session Storage, so a refresh does not lose it.

const user = Layout.requireSignIn();

if (user) {
    Layout.mount("write");
    restoreDraft();
    Utils.watchWordCount(
        document.getElementById("text"),
        document.getElementById("word-count"),
        MIN_WORDS,
    );
}

// Reads everything typed into the form.
function readForm() {
    return {
        title: document.getElementById("title").value,
        language: document.querySelector('input[name="language"]:checked').value,
        text: document.getElementById("text").value,
    };
}

// Puts a saved draft back into the form, if there is one.
function restoreDraft() {
    const draft = Store.readTemp("draft", null);
    if (!draft) return;
    document.getElementById("title").value = draft.title;
    document.getElementById("text").value = draft.text;
    document.querySelector('input[name="language"][value="' + draft.language + '"]').checked = true;
}

// Keeps a copy of the form in Session Storage.
function saveDraft() {
    Store.writeTemp("draft", readForm());
}

// Shows each error under its field and clears the others.
function showErrors(errors) {
    ["title", "text"].forEach(function (field) {
        document.getElementById(field + "-error").textContent = errors[field] || "";
    });
}

document.getElementById("write-form").addEventListener("input", saveDraft);
document.getElementById("write-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const data = readForm();
    const errors = Poems.validate(data);
    showErrors(errors);
    if (Object.keys(errors).length > 0) {
        document.getElementById(errors.title ? "title" : "text").focus();
        return;
    }
    const poem = Poems.create(user.id, data);
    Store.removeTemp("draft");
    window.location.href = "../poem/index.html?id=" + poem.id;
});
