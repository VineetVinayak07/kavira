// about page: the "Back" link goes home if you are signed in, and to sign-in if you are not.

if (Store.read("session", null) !== null) {
    document.getElementById("back-link").href = "../home/index.html";
}
