// join page: validate every field, show the messages, then create the account.

const form = document.getElementById("join-form");
const fieldNames = ["name", "email", "password", "dob", "languages"];

if (Auth.current()) window.location.href = "../home/index.html";

// Reads everything the person typed into one object.
function readForm() {
    const chosen = document.querySelectorAll('input[name="language"]:checked');
    return {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        dob: document.getElementById("dob").value,
        languages: Array.from(chosen).map((box) => box.value),
    };
}

// Writes each message under its field, and clears the ones that are fine.
function showErrors(errors) {
    fieldNames.forEach(function (field) {
        document.getElementById(field + "-error").textContent = errors[field] || "";
        const input = document.getElementById(field);
        if (input) input.setAttribute("aria-invalid", errors[field] ? "true" : "false");
    });
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = readForm();
    const errors = Auth.validateJoin(data);
    showErrors(errors);

    if (Object.keys(errors).length > 0) {
        // Put the cursor on the first problem so it is easy to fix.
        const first = fieldNames.find((field) => errors[field]);
        const target = document.getElementById(first) || document.getElementById("lang-en");
        target.focus();
        return;
    }

    Auth.register(data);
    window.location.href = "../home/index.html";
});
