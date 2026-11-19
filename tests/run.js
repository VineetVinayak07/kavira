// tests/run.js - checks the shared logic without a browser.
// Run with:  node tests/run.js
// It loads the real shared files, so a passing test means the real code works.

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

// Tiny stand-ins for the browser's localStorage and sessionStorage.
function fakeStorage(memory) {
    return {
        getItem: (key) => (key in memory ? memory[key] : null),
        setItem: (key, value) => {
            memory[key] = String(value);
        },
        removeItem: (key) => {
            delete memory[key];
        },
    };
}
const memory = {};
const sessionMemory = {};
const sandbox = {
    localStorage: fakeStorage(memory),
    sessionStorage: fakeStorage(sessionMemory),
    console,
};
vm.createContext(sandbox);

// `const` at the top of a file is not visible outside the vm, so each file is
// followed by lines that copy its objects onto the sandbox.
function load(file, names) {
    const code = fs.readFileSync(path.join(__dirname, "..", "shared", "js", file), "utf8");
    vm.runInContext(code + "\n" + names.map((n) => "this." + n + " = " + n + ";").join("\n"), sandbox);
}
load("utils.js", ["Utils"]);
load("store.js", ["Store"]);
load("auth.js", ["Auth"]);
load("poems.js", ["Poems", "MIN_WORDS"]);
load("reviews.js", ["Reviews", "MIN_REVIEW_WORDS"]);
load("circle.js", ["Circle"]);
const { Utils, Store, Auth, Poems, Reviews, Circle } = sandbox;

let passed = 0;
function test(name, fn) {
    try {
        fn();
        passed++;
        console.log("  ok   " + name);
    } catch (error) {
        console.log("  FAIL " + name + "\n       " + error.message);
        process.exitCode = 1;
    }
}
function reset() {
    [memory, sessionMemory].forEach((m) => Object.keys(m).forEach((key) => delete m[key]));
}
const words = (n) => Array(n).fill("word").join(" ");

console.log("Utils");
test("countWords ignores extra spaces and line breaks", () => {
    assert.strictEqual(Utils.countWords("  hello   world \n again"), 3);
    assert.strictEqual(Utils.countWords(""), 0);
    assert.strictEqual(Utils.countWords("   "), 0);
});
test("ageFrom counts whole years", () => {
    const today = new Date("2026-11-17");
    assert.strictEqual(Utils.ageFrom("2010-11-17", today), 16);
    assert.strictEqual(Utils.ageFrom("2010-11-18", today), 15);
});
test("isEmail", () => {
    assert.ok(Utils.isEmail("asha@example.com"));
    assert.ok(!Utils.isEmail("asha@example"));
    assert.ok(!Utils.isEmail("asha example.com"));
});
test("isStrongPassword needs 8 characters, a letter and a number (regex)", () => {
    assert.ok(Utils.isStrongPassword("poems2026"));
    assert.ok(!Utils.isStrongPassword("short1"));
    assert.ok(!Utils.isStrongPassword("onlyletters"));
    assert.ok(!Utils.isStrongPassword("12345678"));
});
test("timeAgo", () => {
    const now = Date.UTC(2026, 10, 17, 12, 0, 0);
    assert.strictEqual(Utils.timeAgo(now - 30 * 1000, now), "Just now");
    assert.strictEqual(Utils.timeAgo(now - 5 * 60000, now), "5 minutes ago");
    assert.strictEqual(Utils.timeAgo(now - 3 * 3600000, now), "3 hours ago");
    assert.strictEqual(Utils.timeAgo(now - 30 * 3600000, now), "Yesterday");
    assert.strictEqual(Utils.timeAgo(now - 72 * 3600000, now), "3 days ago");
});
test("escapeHtml", () => {
    assert.strictEqual(
        Utils.escapeHtml("<b>\"hi\" & 'bye'</b>"),
        "&lt;b&gt;&quot;hi&quot; &amp; &#39;bye&#39;&lt;/b&gt;",
    );
});

console.log("\nStore");
test("read gives the fallback when nothing is saved, and write then read round-trips", () => {
    reset();
    assert.strictEqual(Store.read("x", 5), 5);
    Store.write("x", { a: [1, 2] });
    assert.strictEqual(Store.read("x", null).a[1], 2);
});
test("session storage is separate from local storage", () => {
    reset();
    Store.writeTemp("draft", { title: "T" });
    assert.strictEqual(Store.readTemp("draft", null).title, "T");
    assert.strictEqual(Store.read("draft", "none"), "none");
    Store.removeTemp("draft");
    assert.strictEqual(Store.readTemp("draft", null), null);
});

console.log("\nAuth");
const today = new Date("2026-11-17");
const good = {
    name: "Asha Rao",
    email: "asha@example.com",
    password: "longenough1",
    dob: "2000-01-01",
    languages: ["English"],
};
test("a good form has no errors", () => {
    reset();
    assert.strictEqual(Object.keys(Auth.validateJoin(good, today)).length, 0);
});
test("each bad field gets its own message", () => {
    reset();
    const errors = Auth.validateJoin(
        { name: "A", email: "nope", password: "short", dob: "", languages: [] },
        today,
    );
    assert.deepStrictEqual(Object.keys(errors).sort(), ["dob", "email", "languages", "name", "password"]);
});
test("a password with no number is refused", () => {
    reset();
    assert.ok(Auth.validateJoin({ ...good, password: "lettersonly" }, today).password);
});
test("under 16 is refused, exactly 16 is allowed", () => {
    reset();
    assert.ok(Auth.validateJoin({ ...good, dob: "2012-01-01" }, today).dob);
    assert.strictEqual(Auth.validateJoin({ ...good, dob: "2010-11-17" }, today).dob, undefined);
});

console.log("\nPoems");
const poemData = (over) => ({ title: "T", language: "English", text: words(80), ...over });
test("a poem needs a title and 80 words", () => {
    assert.deepStrictEqual(Object.keys(Poems.validate(poemData({ text: words(79) }))), ["text"]);
    assert.deepStrictEqual(Object.keys(Poems.validate(poemData({ title: " " }))), ["title"]);
    assert.strictEqual(Object.keys(Poems.validate(poemData())).length, 0);
});
test("the feed is newest first, can be filtered by language, and byAuthor works", () => {
    Poems.items = [
        { id: 1, authorId: "a", title: "Old", language: "English", text: "x", createdAt: 1000 },
        { id: 2, authorId: "b", title: "New", language: "Hindi", text: "x", createdAt: 2000 },
    ];
    assert.strictEqual(Poems.feed()[0].title, "New");
    assert.strictEqual(Poems.feed("English").length, 1);
    assert.strictEqual(Poems.byAuthor("a")[0].title, "Old");
    assert.strictEqual(Poems.byId(2).title, "New");
});
test("saved poems come from the saved ids", () => {
    Poems.savedIds = [2];
    assert.ok(Poems.isSaved(2));
    assert.ok(!Poems.isSaved(1));
    assert.strictEqual(Poems.saved().length, 1);
});
test("excerpt keeps the first lines only", () => {
    assert.strictEqual(Poems.excerpt("a\n\nb\nc\nd\ne", 3), "a\nb\nc");
});

console.log("\nReviews");
test("30 words, one per reader, not on your own poem", () => {
    const poem = { id: 7, authorId: "poet" };
    Reviews.items = [];
    assert.ok(Reviews.check(poem, "poet", words(40)));
    assert.ok(Reviews.check(poem, "reader", words(29)));
    assert.strictEqual(Reviews.check(poem, "reader", words(30)), "");
    Reviews.items = [{ id: 1, poemId: 7, authorId: "reader", text: "x", createdAt: 1 }];
    assert.ok(Reviews.check(poem, "reader", words(30)));
    assert.strictEqual(Reviews.countBy("reader"), 1);
    assert.strictEqual(Reviews.forPoem(7).length, 1);
});

console.log("\nSample data (used if the database cannot be reached)");
test("every poem in data/poems.json is at least 80 words and points at a real poet", () => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "poems.json"), "utf8"));
    data.poems.forEach((p) => {
        assert.ok(Utils.countWords(p.text) >= sandbox.MIN_WORDS, p.title);
        assert.ok(data.poets[p.poet], p.title);
    });
});

console.log("\n" + passed + " passed" + (process.exitCode ? ", some FAILED" : ""));
