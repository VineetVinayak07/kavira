// seed.js - loads a few starter poets and poems from data/poems.json, once per browser,
// so a new visitor never sees an empty site. Uses the Fetch API and JSON.
// The poems are original, written for this project. When a real server arrives, this file goes.
//
// Note: browsers refuse fetch() on files opened by double-click, so open the site with
// VS Code's Live Server (or GitHub Pages). See README.md.

const Seed = {
    // Returns a Promise. It resolves when the starter data is in place and rejects if it cannot be loaded.
    load() {
        if (Store.read("seeded", false)) return Promise.resolve();
        return fetch("../../data/poems.json")
            .then(function (response) {
                if (!response.ok)
                    throw new Error("Could not load data/poems.json (" + response.status + ")");
                return response.json();
            })
            .then(function (data) {
                Seed.save(data);
            });
    },

    // Turns the JSON into stored users and poems.
    save(data) {
        const users = Auth.users();
        const poems = Poems.all();
        const poetIds = data.poets.map(function (poet) {
            const user = {
                id: Store.nextId(users),
                name: poet.name,
                username: poet.name.toLowerCase().replace(/[^a-z]+/g, "_"),
                email: poet.name.toLowerCase().replace(/[^a-z]+/g, ".") + "@kavira.example",
                password: "no-sign-in", // never matches a real fingerprint, so nobody can sign in as a starter poet
                dob: "1990-01-01",
                languages: poet.languages,
                createdAt: Date.now(),
                seed: true,
            };
            users.push(user);
            return user.id;
        });
        data.poems.forEach(function (item) {
            poems.push({
                id: Store.nextId(poems),
                authorId: poetIds[item.poet],
                title: item.title,
                language: item.language,
                text: item.text,
                createdAt: Date.now() - item.hoursAgo * 3600 * 1000,
            });
        });
        Store.write("users", users);
        Store.write("poems", poems);
        Store.write("seeded", true);
    },
};
