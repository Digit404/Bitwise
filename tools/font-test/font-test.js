let fontNum = 3; // initial number of fonts to show

const minusButton = document.querySelector("#minus");
const plusButton = document.querySelector("#plus");
const quill = new Quill("#editor", { theme: "snow" });

let fontList = [];
let fontSettings = [];
let loadedFonts = [];

// fetch the font list from /api/font-list.json
fetch("/api/font-list.json")
    .then((response) => response.json())
    .then((data) => {
        fontList = data.font_families;
    });

function build() {
    const container = document.createElement("div");
    container.classList.add("container");
    document.body.appendChild(container);

    for (let i = 0; i < fontNum; i++) {
        // load settings
        const settings = fontSettings[i] || { font: "Bitter", weight: "400", size: "12pt" };

        const fontColumn = document.createElement("div");
        fontColumn.classList.add("column");

        // create elements for font input
        const fontInput = document.createElement("input");
        fontInput.type = "text";
        fontInput.classList.add("font-input");
        fontInput.placeholder = "Bitter";

        if (settings.font != "Bitter") {
            fontInput.value = settings.font;
        }

        const fontLabel = document.createElement("label");
        fontLabel.innerHTML = "Font Name:";

        // create elements for weight input
        const weightDiv = document.createElement("div");
        const weightInput = document.createElement("input");
        weightInput.type = "text";
        weightInput.classList.add("weight-input");
        weightInput.placeholder = "400";

        if (settings.weight != "400") {
            weightInput.value = settings.weight;
        }

        const weightLabel = document.createElement("label");
        weightLabel.innerHTML = "Weight:";

        // create elements for size input
        const sizeDiv = document.createElement("div");
        const sizeInput = document.createElement("input");
        sizeInput.type = "text";
        sizeInput.classList.add("size-input");

        const sizeLabel = document.createElement("label");
        sizeLabel.innerHTML = "Size:";
        sizeInput.placeholder = "12pt";

        if (settings.size != "12pt") {
            sizeInput.value = settings.size;
        }

        // create container for settings
        const settingsContainer = document.createElement("div");
        settingsContainer.classList.add("settings-container");

        // create output div
        const output = document.createElement("div");
        output.classList.add("output", "quill-output");

        // assemble elements into columns
        fontColumn.appendChild(fontLabel);
        fontColumn.appendChild(fontInput);
        weightDiv.appendChild(weightLabel);
        weightDiv.appendChild(weightInput);
        sizeDiv.appendChild(sizeLabel);
        sizeDiv.appendChild(sizeInput);
        settingsContainer.appendChild(weightDiv);
        settingsContainer.appendChild(sizeDiv);
        fontColumn.appendChild(settingsContainer);
        fontColumn.appendChild(output);
        container.appendChild(fontColumn);
    }

    // attach event listeners to inputs
    const inputs = document.querySelectorAll("input");
    for (let input of inputs) {
        input.addEventListener("input", update);
    }

    return document.querySelectorAll(".column");
}

let columns = build();

// update the output based on input changes
function update() {
    const content = quill.root.innerHTML;
    for (let column of columns) {
        const fontInput = column.querySelector(".font-input");

        let font = findMatchingFont(fontInput.value || "Bitter");
        let weight = column.querySelector(".weight-input").value || "400";
        let size = column.querySelector(".size-input").value || "12pt";

        const output = column.querySelector(".output");

        // save settings
        const index = Array.from(columns).indexOf(column);
        fontSettings[index] = { font, weight, size };

        if (parseInt(size)) {
            size += "pt";
        }

        output.innerHTML = content;
        output.style.fontFamily = `"${font}"`;
        output.style.fontWeight = weight;
        output.style.fontSize = size;

        // load the font from Google Fonts if it's in the font list
        if (fontList.includes(font) && font !== "Bitter") {
            loadGoogleFont(font);
            fontInput.classList.add("google-font");
            fontInput.title = "This font is available from Google Fonts";

        } else {
            fontInput.classList.remove("google-font");
        }
    }
}

// find a matching font from the font list
function findMatchingFont(inputFont) {
    let matchedFont = fontList.find((font) => font.toLowerCase() === inputFont.toLowerCase());
    return matchedFont ? matchedFont : inputFont;
}

// load the font from Google Fonts
function loadGoogleFont(font) {
    // check if the font is already loaded
    if (loadedFonts.includes(font)) {
        return;
    }

    console.log("Loading font:", font);

    // pretty sure you can just load the font once and it will be available
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;700&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    loadedFonts.push(font);
}

quill.on("text-change", update);

// handle minus button click to decrease fontNum
minusButton.addEventListener("click", () => {
    if (fontNum > 2) {
        fontNum--;
        columns.forEach((column) => column.remove());
        columns = build();
        update();
    }
});

// Initialize dark mode
function initDarkMode() {
    const darkModeButton = document.createElement("button");
    darkModeButton.id = "dark-mode-button";
    darkModeButton.textContent = "light_mode";
    document.body.appendChild(darkModeButton);
    darkModeButton.addEventListener("click", toggleDarkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const darkModeButton = document.getElementById("dark-mode-button");
    darkModeButton.textContent = document.body.classList.contains("dark") ? "dark_mode" : "light_mode";
}

// handle plus button click to increase fontNum
plusButton.addEventListener("click", () => {
    fontNum++;
    columns.forEach((column) => column.remove());
    columns = build();
    update();
});

// initialize on window load
window.onload = function () {
    update();
    initDarkMode();
};
