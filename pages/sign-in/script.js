// sign-in page: check the form, then sign the person in.

const form = document.getElementById("sign-in-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Already signed in? Go straight to Home.
if (Auth.current()) window.location.href = "../home/index.html";

function showError(input, message) {
    document.getElementById(input.id + "-error").textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
}

form.addEventListener("submit", function (event) {
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

    const user = Auth.signIn(emailInput.value, passwordInput.value);
    if (user === null) {
        showError(passwordInput, "Email or password is not right.");
        return;
    }
    window.location.href = "../home/index.html";
});
