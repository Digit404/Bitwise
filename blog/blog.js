// Dark mode button
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

// Hamburger button
if (document.querySelector("nav")) {
    const hamburgerButton = document.createElement("div");
    hamburgerButton.id = "hamburger-button";
    hamburgerButton.textContent = "menu";
    document.querySelector("nav").prepend(hamburgerButton);

    document.addEventListener("DOMContentLoaded", () => {
        const navLinks = document.querySelector('nav ul');

        hamburgerButton.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'block' ? 'none' : 'block';
        });
    });
}

// add section links
document.querySelectorAll('article h2, article h3').forEach((heading) => {
    const id = heading.id;

    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = "§";

    heading.prepend(link);
    
});