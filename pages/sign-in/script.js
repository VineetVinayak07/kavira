// sign-in page: check the form, then sign the person in.

const form = document.getElementById("sign-in-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Already signed in? Go straight to Home.
Auth.current()
    .then(function (user) {
        if (user) window.location.href = "../home/index.html";
    })
    .catch(function () {});

// Shows (or clears) the message under a field.
function showError(input, message) {
    document.getElementById(input.id + "-error").textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError(emailInput, "");
    showError(passwordInput, "");

    if (!Utils.isEmail(emailInput.value.trim())) {
        showError(emailInput, "Enter your email address.");
        return;
    }
    if (passwordInput.value === "") {
        showError(passwordInput, "Enter your password.");
        return;
    }

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    const user = await Auth.signIn(emailInput.value, passwordInput.value);
    if (user === null) {
        button.disabled = false;
        showError(passwordInput, "Email or password is not right.");
        return;
    }
    window.location.href = "../home/index.html";
});
