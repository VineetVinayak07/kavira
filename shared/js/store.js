// store.js - the ONLY file that touches browser storage.
// Every page asks the Store for data and never calls localStorage directly.
// Later, when we add a real server, only this file changes.

const Store = {
    prefix: "kavira:",

    // Read a saved value, or `fallback` if nothing is saved yet.
    read(key, fallback) {
        try {
            const raw = localStorage.getItem(this.prefix + key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    },

    // Returns true when saved, false when the browser refused (for example storage is full).
    write(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn("Could not save " + key + ":", error);
            return false;
        }
    },

    // Session Storage: lasts only while this browser tab is open. Used for the unsaved poem draft.
    readTemp(key, fallback) {
        try {
            const raw = sessionStorage.getItem(this.prefix + key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    },

    writeTemp(key, value) {
        try {
            sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (error) {
            console.warn("Could not keep the draft:", error);
        }
    },

    removeTemp(key) {
        sessionStorage.removeItem(this.prefix + key);
    },

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    },

    // Gives the next free number for a list, so every item has its own id.
    nextId(list) {
        return list.reduce((biggest, item) => Math.max(biggest, item.id), 0) + 1;
    },
};
