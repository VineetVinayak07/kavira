// circle.js - a poet's circle: up to 5 other poets who write in the same language.
// The circle is picked at random the first time it is needed, then kept.
// (Stored on the person: user.circle = [id, id, ...])

const CIRCLE_SIZE = 6; // including the poet themself

const Circle = {
    // Shuffles a list into a random order (Fisher-Yates). Returns a new list.
    shuffle(list) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    },

    // Picks the circle for `user` from everybody who shares a language.
    pick(user, everyone) {
        const sharesLanguage = (other) =>
            other.id !== user.id && other.languages.some((lang) => user.languages.includes(lang));
        return this.shuffle(everyone.filter(sharesLanguage))
            .slice(0, CIRCLE_SIZE - 1)
            .map((other) => other.id);
    },

    // Returns the circle's members as people. Creates the circle if there is none yet.
    members(user) {
        const users = Auth.users();
        const me = users.find((u) => u.id === user.id);
        if (!me.circle) {
            me.circle = this.pick(me, users);
            Store.write("users", users);
        }
        return me.circle.map((id) => Auth.byId(id)).filter(Boolean);
    },

    // Poems written by the circle's members, newest first.
    poems(user) {
        const ids = this.members(user).map((member) => member.id);
        return Poems.feed().filter((poem) => ids.includes(poem.authorId));
    },
};
