// about page: the "Back" link goes home if you are signed in, and to sign-in if you are not.

Auth.current()
    .then(function (user) {
        if (user) document.getElementById("back-link").href = "../home/index.html";
    })
    .catch(function () {});
