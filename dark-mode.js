// Initialize dark mode
function initDarkMode() {
    const darkModeButton = document.createElement("button");
    darkModeButton.id = "dark-mode-button";
    darkModeButton.textContent = "light_mode";
    document.body.appendChild(darkModeButton);
    darkModeButton.addEventListener("click", toggleDarkMode);

    const stylesheet = document.createElement("style");
    stylesheet.innerHTML = `
        #dark-mode-button {
            background-color: var(--text-color);
            color: var(--bg);
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            font-family: var(--font-icons);
            font-size: 2rem;
            z-index: 1000;
            border: medium;
            border-radius: 50%;
            cursor: pointer;
            user-select: none;
            transition: background-color 0.2s ease;
        }

        #dark-mode-button:hover {
            background-color: var(--text-color-hover);
        }`;

    document.head.appendChild(stylesheet);

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkMode = localStorage.getItem("dark-mode") || (prefersDark ? "enabled" : "disabled");

    if (darkMode === "enabled") {
        document.body.classList.add("dark");
        darkModeButton.textContent = "light_mode";
    } else {
        document.body.classList.remove("dark");
        darkModeButton.textContent = "dark_mode";
    }

    localStorage.setItem("dark-mode", darkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const darkModeButton = document.getElementById("dark-mode-button");
    darkModeButton.textContent = document.body.classList.contains("dark") ? "light_mode" : "dark_mode";
    localStorage.setItem("dark-mode", document.body.classList.contains("dark") ? "enabled" : "disabled");
}

// initialize on window load
window.onload = function () {
    initDarkMode();
};
