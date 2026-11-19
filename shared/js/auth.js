// auth.js - create accounts, sign in, sign out, and know who is signed in.
// Passwords and sessions are handled by Supabase Auth, so we never see or store a password.

const MIN_AGE = 16;
const MIN_PASSWORD_LENGTH = 8;

const Auth = {
    profiles: [], // every poet's public details (id, name, languages), filled in by Poems.load()
    me: null, // the signed-in poet, remembered after the first lookup

    // Returns an object of error messages. Empty object = everything is valid.
    validateJoin(data, today = new Date()) {
        const errors = {};
        if (data.name.trim().length < 2) errors.name = "Enter the name you want on your poems.";
        if (!Utils.isEmail(data.email.trim())) errors.email = "Enter a valid email address.";
        if (!Utils.isStrongPassword(data.password))
            errors.password =
                "Use at least " + MIN_PASSWORD_LENGTH + " characters, with a letter and a number.";
        if (!data.dob) errors.dob = "Enter your date of birth.";
        else if (Utils.ageFrom(data.dob, today) < MIN_AGE)
            errors.dob = "Kavira is for poets aged " + MIN_AGE + " and over.";
        if (data.languages.length === 0) errors.languages = "Choose at least one language.";
        return errors;
    },

    // Turns a Supabase error into a sentence a person can understand.
    friendlyError(error) {
        const text = (error && error.message ? error.message : "").toLowerCase();
        if (text.includes("already registered")) return "An account with this email already exists.";
        if (text.includes("16 or older")) return "Kavira is for poets aged " + MIN_AGE + " and over.";
        if (text.includes("rate limit")) return "Too many tries. Wait a minute and try again.";
        if (text.includes("fetch") || text.includes("network"))
            return "Could not reach the server. Check your internet and try again.";
        return "Something went wrong. Please try again.";
    },

    // Creates the account and signs the person in. Call validateJoin first.
    // Throws an Error with a friendly message if it fails.
    async register(data) {
        const { data: result, error } = await db.auth.signUp({
            email: data.email.trim().toLowerCase(),
            password: data.password,
            options: {
                data: { name: data.name.trim(), languages: data.languages, dob: data.dob },
            },
        });
        if (error) throw new Error(this.friendlyError(error));
        if (!result.session) throw new Error("Check your email to confirm your account, then sign in.");
        return result.user;
    },

    // Returns the user, or null when the email or password is wrong.
    async signIn(email, password) {
        const { data, error } = await db.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password,
        });
        return error ? null : data.user;
    },

    async signOut() {
        await db.auth.signOut();
        this.me = null;
    },

    // Finds a poet by id (used to show an author's name on a poem). Needs Poems.load() first.
    byId(id) {
        return this.profiles.find((poet) => poet.id === id) || null;
    },

    // Who is signed in? Returns { id, name, languages, email } or null.
    async current() {
        const { data } = await db.auth.getSession();
        if (!data.session) return null;
        const userId = data.session.user.id;
        if (this.me && this.me.id === userId) return this.me;
        const { data: row } = await db
            .from("profiles")
            .select("id, name, languages")
            .eq("id", userId)
            .single();
        // If the database is unreachable, fall back to the details saved in the login itself.
        const saved = data.session.user.user_metadata || {};
        const details = row || (saved.name ? { name: saved.name, languages: saved.languages } : null);
        if (!details) return null;
        this.me = {
            id: userId,
            name: details.name,
            languages: details.languages || ["English"],
            email: data.session.user.email,
        };
        return this.me;
    },
};
