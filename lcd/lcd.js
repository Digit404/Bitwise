const panels = document.querySelectorAll(".lcd-panel");

for (let panel of panels) {
    initializePanel(panel);
}

function initializePanel(panel) {
    // store panel properties in the panel object
    panel.rows = Array.from(panel.querySelectorAll(".row"));
    panel.computedStyle = getComputedStyle(panel);
    panel.width = parseInt(panel.computedStyle.getPropertyValue("--width"));
    panel.height = parseInt(panel.computedStyle.getPropertyValue("--height"));

    if (panel.height < panel.rows.length) {
        panel.style.setProperty("--height", panel.rows.length);
        panel.height = panel.rows.length;
    } else if (panel.height > panel.rows.length) {
        // create additional rows if necessary
        const fragment = document.createDocumentFragment();
        for (let i = panel.rows.length; i < panel.height; i++) {
            const row = document.createElement("div");
            row.classList.add("row");
            row.textContent = " ".repeat(panel.width);
            fragment.appendChild(row);
        }
        panel.appendChild(fragment);
        panel.rows = Array.from(panel.querySelectorAll(".row"));
    }

    panel.rows.forEach((row) => {
        // store row properties in the row object, and update the row content
        const initialContent = row.textContent;

        if (initialContent.length > panel.width) {
            panel.style.setProperty("--width", initialContent.length);
            panel.width = initialContent.length;
        }

        row.initialContent = initialContent;
        row.paddedContent = evenPad(initialContent, panel.width);
        updateRow(row, row.paddedContent);
    });

    animatePanel(panel, 300, 10);
}

function evenPad(string, width) {
    let padding = Math.floor((width - string.length) / 2);
    return string.padStart(padding + string.length, " ").padEnd(width, " ");
}

function updateRow(row, string) {
    const fragment = document.createDocumentFragment();
    for (let char of string) {
        const span = document.createElement("span");
        span.classList.add("lcd-panel-char");
        span.textContent = char;
        fragment.appendChild(span);
    }
    row.innerHTML = "";
    row.appendChild(fragment);
}

function animatePanel(panel, interval = 500, pauseCycles = 5) {
    let index = 0;

    setInterval(() => {
        for (let row of panel.rows) {
            if (index > panel.width) break;
            let rotatedString =
                row.paddedContent.slice(index) +
                row.paddedContent.slice(0, index);
            updateRow(row, rotatedString);
        }

        index = (index + 1) % (panel.width + pauseCycles);
    }, interval);
}
