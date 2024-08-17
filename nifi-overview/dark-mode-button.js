const darkModeButton = document.createElement("button");
darkModeButton.id = "dark-mode-button";
darkModeButton.textContent = "light_mode";
document.body.appendChild(darkModeButton);

const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (darkMode) {
    toggleDarkMode();
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    darkModeButton.textContent = document.body.classList.contains("dark") ? "dark_mode" : "light_mode";
}

darkModeButton.addEventListener("click", toggleDarkMode);
