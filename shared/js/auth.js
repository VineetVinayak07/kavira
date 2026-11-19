// auth.js - create accounts, sign in, sign out, and know who is signed in.
// NOTE: this version keeps accounts in the browser only, so it is a demo.
// The password "hash" below is NOT secure. A real server will do proper hashing.

const MIN_AGE = 16;
const MIN_PASSWORD_LENGTH = 8;

const Auth = {
    users() {
        return Store.read("users", []);
    },

    // A simple fingerprint of the password (demo only).
    fingerprint(password) {
        let hash = 5381;
        for (const character of password) hash = (hash * 33 + character.charCodeAt(0)) >>> 0;
        return String(hash);
    },

    // Returns an object of error messages. Empty object = everything is valid.
    validateJoin(data, today = new Date()) {
        const errors = {};
        if (data.name.trim().length < 2) errors.name = "Enter the name you want on your poems.";
        if (!Utils.isEmail(data.email.trim())) errors.email = "Enter a valid email address.";
        else if (this.findByEmail(data.email))
            errors.email = "An account with this email already exists.";
        if (!Utils.isStrongPassword(data.password))
            errors.password =
                "Use at least " + MIN_PASSWORD_LENGTH + " characters, with a letter and a number.";
        if (!data.dob) errors.dob = "Enter your date of birth.";
        else if (Utils.ageFrom(data.dob, today) < MIN_AGE)
            errors.dob = "Kavira is for poets aged " + MIN_AGE + " and over.";
        if (data.languages.length === 0) errors.languages = "Choose at least one language.";
        return errors;
    },

    findByEmail(email) {
        const wanted = email.trim().toLowerCase();
        return this.users().find((user) => user.email === wanted) || null;
    },

    // Creates the account and signs the person in. Call validateJoin first.
    register(data) {
        const users = this.users();
        const user = {
            id: Store.nextId(users),
            name: data.name.trim(),
            username: data.name
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, ""),
            email: data.email.trim().toLowerCase(),
            password: this.fingerprint(data.password),
            dob: data.dob,
            languages: data.languages,
            createdAt: Date.now(),
        };
        users.push(user);
        Store.write("users", users);
        Store.write("session", user.id);
        return user;
    },

    // Returns the user, or null when the email or password is wrong.
    signIn(email, password) {
        const user = this.findByEmail(email);
        if (!user || user.password !== this.fingerprint(password)) return null;
        Store.write("session", user.id);
        return user;
    },

    signOut() {
        Store.remove("session");
    },

    // Finds a person by id (used to show an author's name on a poem).
    byId(id) {
        return this.users().find((user) => user.id === id) || null;
    },

    current() {
        const id = Store.read("session", null);
        return this.users().find((user) => user.id === id) || null;
    },
};
