// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordIcon.classList.remove('fa-eye');
        togglePasswordIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        togglePasswordIcon.classList.remove('fa-eye-slash');
        togglePasswordIcon.classList.add('fa-eye');
    }
}

// Save to localStorage on form submit
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const rememberMe = document.getElementById("rememberMe");

    if (localStorage.getItem("rememberMe") === "true") {
        emailInput.value = localStorage.getItem("savedEmail") || "";
        passwordInput.value = localStorage.getItem("savedPassword") || "";
        rememberMe.checked = true;
    }

    form.addEventListener("submit", function () {
        if (rememberMe.checked) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("savedEmail", emailInput.value);
            localStorage.setItem("savedPassword", passwordInput.value); // remove if needed
        } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("savedEmail");
            localStorage.removeItem("savedPassword");
        }
    });
});
