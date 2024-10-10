function loadCSS(url) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
        document.head.appendChild(link);
    });
}

function loadJS(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

// Initialize dark mode
function initDarkMode() {
    const darkModeButton = document.createElement("button");
    darkModeButton.id = "dark-mode-button";
    darkModeButton.textContent = "light_mode";
    document.body.appendChild(darkModeButton);

    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (darkMode) {
        toggleDarkMode();
    }

    darkModeButton.addEventListener("click", toggleDarkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const darkModeButton = document.getElementById("dark-mode-button");
    darkModeButton.textContent = document.body.classList.contains("dark") ? "dark_mode" : "light_mode";
}

// Initialize hamburger button
function initHamburger() {
    const nav = document.querySelector("nav");
    if (nav) {
        const hamburgerButton = document.createElement("div");
        hamburgerButton.id = "hamburger-button";
        hamburgerButton.textContent = "menu";
        nav.prepend(hamburgerButton);

        const navLinks = document.querySelector("nav ul");
        hamburgerButton.addEventListener("click", () => {
            navLinks.style.display = navLinks.style.display === "block" ? "none" : "block";
        });
    }
}

// Create overview section
function initOverview() {
    const overview = document.createElement("aside");
    overview.classList.add("overview");

    const overviewTitle = document.createElement("h3");
    overviewTitle.textContent = "OVERVIEW";
    overview.appendChild(overviewTitle);

    const overviewList = document.createElement("ul");
    overview.appendChild(overviewList);

    const headers = document.querySelectorAll("article h2, article h3");
    let lastH2ListItem = null;

    headers.forEach((heading) => {
        const { textContent: name, id, tagName } = heading;

        const link = document.createElement("a");
        link.href = `#${id}`;
        link.textContent = "link";
        link.classList.add("icon");
        heading.prepend(link);

        const listItem = document.createElement("li");
        const listItemLink = document.createElement("a");
        listItemLink.href = `#${id}`;
        listItemLink.textContent = name;
        listItem.appendChild(listItemLink);

        if (tagName === "H2") {
            overviewList.appendChild(listItem);
            lastH2ListItem = listItem;
        } else if (tagName === "H3" && lastH2ListItem) {
            let sublist = lastH2ListItem.querySelector("ul") || document.createElement("ul");
            if (!sublist.parentNode) {
                lastH2ListItem.appendChild(sublist);
            }
            sublist.appendChild(listItem);
        }
    });

    document.querySelector("main").appendChild(overview);
}

function initNav() {
    const nav = document.createElement("nav");

    const title = document.createElement("a");
    title.href = "/";
    title.textContent = "Bitwise";
    nav.appendChild(title);

    const ul = document.createElement("ul");
    nav.appendChild(ul);

    // hard coding for now

    const home = document.createElement("li");
    const homeLink = document.createElement("a");
    homeLink.href = "/blog";
    homeLink.textContent = "Home";
    home.appendChild(homeLink);
    ul.appendChild(home);

    const nifi = document.createElement("li");
    const nifiLink = document.createElement("a");
    nifiLink.href = "/blog/nifi-overview";
    nifiLink.classList.add("active-item");
    nifiLink.textContent = "NiFi Overview";
    nifi.appendChild(nifiLink);
    ul.appendChild(nifi);
    
    document.body.prepend(nav);
}

function initFooter() {
    const footer = document.createElement("footer");
    const backToTop = document.createElement("a");
    backToTop.href = "#";
    backToTop.textContent = "expand_circle_up";
    backToTop.classList.add("icon");
    backToTop.id = "back-to-top";
    footer.appendChild(backToTop);
    
    const credit = document.createElement("a");
    credit.href = "/"
    credit.textContent = "rebitwise.com";
    footer.appendChild(credit);

    document.body.appendChild(footer);
}

async function highlightCode() {
    const codeBlocks = document.querySelectorAll("code.block");

    if (codeBlocks.length === 0) {
        return;
    }

    await loadCSS("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css")
    await loadJS("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js");

    for (let block of codeBlocks) {
        hljs.highlightElement(block);
    }
}

function addCopyButtons () {
    for (let block of document.querySelectorAll('code.block')) {
        const copyButton = document.createElement('button');
        copyButton.textContent = 'content_copy';
        copyButton.classList.add('icon');
        copyButton.classList.add('copy-button');
        block.appendChild(copyButton);

        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent).then(() => {
                copyButton.textContent = 'check';
                setTimeout(() => {
                    copyButton.textContent = 'content_copy';
                }, 1000);
            });
        });
    }
}

async function init() {
    initDarkMode();

    initNav();
    initHamburger();
    initOverview();
    initFooter();

    await highlightCode()
    addCopyButtons();
}