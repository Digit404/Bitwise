// Initialize dark mode
function initDarkMode() {
    const darkModeButton = document.createElement("button");
    darkModeButton.id = "dark-mode-button";
    darkModeButton.textContent = "light_mode";
    document.body.appendChild(darkModeButton);
    darkModeButton.addEventListener("click", toggleDarkMode);
    
    Object.assign(darkModeButton.style, {
        backgroundColor: "var(--text-color)",
        color: "var(--bg)",
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "50px",
        height: "50px",
        fontFamily: "var(--font-icons)",
        fontSize: "2rem",
        zIndex: 1000,
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        userSelect: "none",
    });

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkMode = localStorage.getItem("dark-mode") || (prefersDark ? "enabled" : "disabled");

    if (darkMode === "enabled") {
        document.body.classList.add("dark");
        darkModeButton.textContent = "dark_mode";
    } else {
        document.body.classList.remove("dark");
        darkModeButton.textContent = "light_mode";
    }

    localStorage.setItem("dark-mode", darkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const darkModeButton = document.getElementById("dark-mode-button");
    darkModeButton.textContent = document.body.classList.contains("dark") ? "dark_mode" : "light_mode";
    localStorage.setItem("dark-mode", document.body.classList.contains("dark") ? "enabled" : "disabled");
}

// initialize on window load
window.onload = function () {
    initDarkMode();
};
