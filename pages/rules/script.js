// rules page: when it is shown inside the About page (an iframe), hide its own header.

if (window.self !== window.top) {
    document.body.classList.add("embedded");
}
