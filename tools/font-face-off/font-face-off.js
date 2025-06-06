let fontNum = 3; // initial number of fonts to show

const minusButton = document.querySelector("#minus");
const plusButton = document.querySelector("#plus");
const quill = new Quill("#editor", { theme: "snow" });
const scaleSlider = document.getElementById("font-scale");

let fontList;
let fontSettings = [];
let loadedFonts = [];
let columns;

// fetch the font list from /api/font-list.json
fetch("/api/font-list.json")
    .then((response) => response.json())
    .then((data) => {
        fontList = data;
    })
    .then(() => {
        columns = build();
        update();
    });

function build() {
    const container = document.getElementById("font-container");

    for (let i = 0; i < fontNum; i++) {
        // load settings
        const settings = fontSettings[i] || { font: "Bitter", weight: "400", size: "12pt" };

        const fontColumn = document.createElement("div");
        fontColumn.classList.add("column");

        // create elements for font input
        const fontInput = document.createElement("input");
        fontInput.type = "text";
        fontInput.classList.add("text-input");
        fontInput.placeholder = "Bitter";

        if (settings.font != "Bitter") {
            fontInput.value = settings.font;
        }

        // create a datalist for font suggestions
        const datalist = document.createElement("datalist");
        datalist.id = `font-suggestions-${i}`;

        // attach the datalist to the input
        fontInput.setAttribute("list", datalist.id);

        // populate the datalist with font options from google fonts
        fontList.google_fonts.forEach((font) => {
            const option = document.createElement("option");
            option.value = font;
            datalist.appendChild(option);
        });

        // populate the datalist with font options from web safe fonts
        fontList.websafe_fonts.forEach((font) => {
            const option = document.createElement("option");
            option.value = font;
            datalist.appendChild(option);
        });

        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options-container");

        const fontLabel = document.createElement("label");
        fontLabel.innerHTML = "Font Name:";

        const transformLabel = document.createElement("label");
        transformLabel.innerHTML = "Transform:";
        const transformButton = document.createElement("button");
        transformButton.classList.add("button");
        transformButton.innerHTML = "none";
        transformButton.style.textTransform = "capitalize";

        // create elements for weight input
        const weightDiv = document.createElement("div");
        const weightInput = document.createElement("input");
        weightInput.classList.add("small-slider");
        weightInput.type = "range";
        weightInput.min = "100";
        weightInput.max = "900";
        weightInput.step = "10";
        weightInput.classList.add("weight-input");
        weightInput.value = "400";

        if (settings.weight != "400") {
            weightInput.value = settings.weight;
        }

        const weightLabel = document.createElement("label");
        weightLabel.innerHTML = "Weight:";
        const weightOutput = document.createElement("span");
        weightOutput.classList.add("indicator", "weight-indicator");
        weightOutput.innerHTML = "400";
        weightOutput.contentEditable = true;

        // create elements for size input
        const sizeDiv = document.createElement("div");
        const sizeInput = document.createElement("input");
        sizeInput.classList.add("small-slider");
        sizeInput.type = "range";
        sizeInput.min = "5";
        sizeInput.max = "100";
        sizeInput.step = "0.5";
        sizeInput.classList.add("size-input");
        sizeInput.value = "12";

        const sizeLabel = document.createElement("label");
        sizeLabel.innerHTML = "Size:";
        const sizeOutput = document.createElement("span");
        sizeOutput.classList.add("indicator", "size-indicator");
        sizeOutput.innerHTML = "12pt";
        sizeOutput.contentEditable = true;

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
        optionsContainer.appendChild(fontLabel);
        optionsContainer.appendChild(fontInput);
        optionsContainer.appendChild(datalist);
        optionsContainer.appendChild(transformLabel);
        optionsContainer.appendChild(transformButton);
        weightDiv.appendChild(weightLabel);
        weightLabel.appendChild(weightOutput);
        weightDiv.appendChild(weightInput);
        sizeDiv.appendChild(sizeLabel);
        sizeLabel.appendChild(sizeOutput);
        sizeDiv.appendChild(sizeInput);
        settingsContainer.appendChild(weightDiv);
        settingsContainer.appendChild(sizeDiv);
        optionsContainer.appendChild(settingsContainer);
        fontColumn.appendChild(optionsContainer);
        fontColumn.appendChild(output);
        container.appendChild(fontColumn);

        // attach event listeners to indicators
        weightOutput.addEventListener("focusout", () => {
            weightInput.value = weightOutput.innerHTML;
            update();
        });

        sizeOutput.addEventListener("focusout", () => {
            sizeInput.value = sizeOutput.innerHTML.replace("pt", "");
            update();
        });

        // attach event listener to transform button
        transformButton.addEventListener("click", () => {
            const transforms = ["none", "uppercase", "lowercase"];
            const currentTransform = transformButton.innerText;
            const transformIndex = transforms.indexOf(currentTransform.toLowerCase());
            const nextTransform = transforms[(transformIndex + 1) % transforms.length];
            transformButton.innerHTML = nextTransform;
            output.style.textTransform = nextTransform;
            update();
        });
    }

    // attach event listeners to inputs
    const inputs = document.querySelectorAll("input");
    for (let input of inputs) {
        input.addEventListener("input", update);
    }

    return document.querySelectorAll(".column");
}

// update the output based on input changes
function update() {
    const content = quill.root.innerHTML;
    for (let column of columns) {
        const fontInput = column.querySelector(".text-input");

        let font = findMatchingFont(fontInput.value);
        let weight = column.querySelector(".weight-input").value || "400";
        let size = column.querySelector(".size-input").value || "12pt";

        const output = column.querySelector(".output");

        // save settings
        const index = Array.from(columns).indexOf(column);
        fontSettings[index] = { font, weight, size };

        size = size.match(/-?\d+(\.\d+)?/)[0];

        // set indicators
        column.querySelector(".weight-indicator").innerHTML = weight;
        column.querySelector(".size-indicator").innerHTML = size + "pt";

        output.innerHTML = content;
        output.style.fontFamily = `"${font}"`;
        output.style.fontWeight = weight;
        output.style.fontSize = size * scaleSlider.value + "pt";

        // load the font from Google Fonts if it's in the font list
        if (fontList.google_fonts.includes(font) && font !== "Bitter") {
            loadGoogleFont(font);
            fontInput.classList.remove("web-safe-font");
            fontInput.classList.add("google-font");
            fontInput.title = "This font is available from Google Fonts";
        } else if (fontList.websafe_fonts.includes(font)) {
            fontInput.classList.remove("google-font");
            fontInput.classList.add("web-safe-font");
            fontInput.title = "This is a web-safe font";
        } else {
            fontInput.classList.remove("google-font", "web-safe-font");
            fontInput.title = "";
        }
    }
}

// find a matching font from the font list return bitter if empty and the original string if not found
function findMatchingFont(font) {
    if (!font) {
        return "Bitter";
    }

    const lowerCaseFont = font.toLowerCase();
    let matchingFont = fontList.websafe_fonts.find((f) => f.toLowerCase() === lowerCaseFont);
    if (!matchingFont) {
        matchingFont = fontList.google_fonts.find((f) => f.toLowerCase() === lowerCaseFont);
    }
    return matchingFont || font;
}

// load the font from Google Fonts
function loadGoogleFont(font) {
    // check if the font is already loaded
    if (loadedFonts.includes(font)) {
        return;
    }

    console.log("Loading font:", font);

    // Loading each font twice is the only way to get both static and variable fonts to work together
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@100..900&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const staticLink = document.createElement("link");
    staticLink.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    staticLink.rel = "stylesheet";
    document.head.appendChild(staticLink);

    loadedFonts.push(font);
}

quill.on("text-change", update);

function reduceFontNum() {
    if (fontNum <= 1) {
        return;
    }
    fontNum--;
    columns.forEach((column) => column.remove());
    columns = build();
    update();
}

function increaseFontNum() {
    if (fontNum >= 8) {
        return;
    }
    fontNum++;
    columns.forEach((column) => column.remove());
    columns = build();
    update();
}

scaleSlider.addEventListener("input", update);

// handle minus button click to decrease fontNum
minusButton.addEventListener("click", reduceFontNum);

// handle plus button click to increase fontNum
plusButton.addEventListener("click", increaseFontNum);

document.addEventListener("keydown", (event) => {
    if (quill.hasFocus() || event.target.tagName.toLowerCase() === "input") {
        return;
    }

    if (event.key === "+" || event.key === "=") {
        increaseFontNum();
    } else if (event.key === "-" || event.key === "_") {
        reduceFontNum();
    }
});
