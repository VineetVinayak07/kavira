// layout.js - draws the left menu on every signed-in page, so the menu
// exists in ONE place instead of being copied into every HTML file.
// Usage in a page:  Layout.mount("home");

const Layout = {
    // key matches the page folder name. `path` is the icon drawing (SVG).
    items: [
        {
            key: "home",
            label: "Home",
            path: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
        },
        {
            key: "circle",
            label: "My circle",
            path: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
        },
        {
            key: "write",
            label: "Write",
            path: "M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
        },
        {
            key: "profile",
            label: "Profile",
            path: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
        },
    ],

    // Draws the menu inside <nav id="menu">, marking the current page.
    mount(activeKey) {
        const links = this.items.map((item) => {
            const current = item.key === activeKey ? ' aria-current="page"' : "";
            return (
                '<a href="../' +
                item.key +
                '/index.html"' +
                current +
                ">" +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
                item.path +
                '"></path></svg>' +
                "<span>" +
                item.label +
                "</span>" +
                "</a>"
            );
        });
        document.getElementById("menu").innerHTML = links.join("");
    },

    // Sends signed-out visitors to the sign-in page. Returns the user otherwise.
    requireSignIn() {
        const user = Auth.current();
        if (!user) window.location.href = "../sign-in/index.html";
        return user;
    },
};
