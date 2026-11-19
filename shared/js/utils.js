// utils.js - small helper functions used by many pages.
// Each one does one job and has no side effects, so each is easy to test.

const Utils = {
    // "  hello   world " -> 2
    countWords(text) {
        return text.trim().split(/\s+/).filter(Boolean).length;
    },

    // Age in whole years. dob is "YYYY-MM-DD". today defaults to now.
    ageFrom(dob, today = new Date()) {
        const born = new Date(dob);
        let age = today.getFullYear() - born.getFullYear();
        const hadBirthday =
            today.getMonth() > born.getMonth() ||
            (today.getMonth() === born.getMonth() && today.getDate() >= born.getDate());
        if (!hadBirthday) age--;
        return age;
    },

    isEmail(text) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    },

    // Password rule, written as a regular expression:
    // at least 8 characters, with at least one letter and one number.
    isStrongPassword(text) {
        return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(text);
    },

    // 17 Nov 2026
    fullDate(timestamp) {
        return new Date(timestamp).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    },

    // Keeps a "12 of 80 words" label up to date while someone types.
    // Returns a function that re-counts on demand (a closure: it remembers box, label and minimum).
    watchWordCount(box, label, minimum) {
        function update() {
            const words = Utils.countWords(box.value);
            label.textContent =
                words >= minimum ? words + " words" : words + " of " + minimum + " words";
            label.dataset.enough = words >= minimum ? "true" : "false";
        }
        box.addEventListener("input", update);
        update();
        return update;
    },

    // 1 hour ago, Yesterday, 3 days ago ...
    timeAgo(timestamp, now = Date.now()) {
        const minutes = Math.floor((now - timestamp) / 60000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
        const days = Math.floor(hours / 24);
        if (days === 1) return "Yesterday";
        return days + " days ago";
    },

    // Makes user text safe to put inside innerHTML.
    escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    },
};
