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
    panel.centered = panel.computedStyle.getPropertyValue("--centered") === "true";
    panel.scroll = panel.computedStyle.getPropertyValue("--scroll") === "true";
    panel.scrollSpeed = parseInt(panel.computedStyle.getPropertyValue("--scroll-speed"));
    panel.pauseFrames = parseInt(panel.computedStyle.getPropertyValue("--scroll-pause-frames"));

    // adjust panel height if necessary
    if (panel.height < panel.rows.length) {
        panel.style.setProperty("--height", panel.rows.length);
        panel.height = panel.rows.length;
    } else if (panel.height > panel.rows.length) {
        // create additional rows if necessary
        const fragment = document.createDocumentFragment();
        for (let i = panel.rows.length; i < panel.height; i++) {
            const row = document.createElement("span");
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

        // adjust panel width if necessary
        if (initialContent.length > panel.width) {
            panel.style.setProperty("--width", initialContent.length);
            panel.width = initialContent.length;
        }

        row.initialContent = initialContent;
        if (panel.centered) {
            let padding = Math.floor((panel.width - initialContent.length) / 2);
            row.paddedContent = initialContent.padStart(padding + initialContent.length, " ").padEnd(panel.width, " ");
        } else {
            row.paddedContent = initialContent.padEnd(panel.width, " ");
        }
        updateRow(row, row.paddedContent);
    });

    if (panel.scroll) scrollPanel(panel, panel.scrollSpeed, panel.pauseFrames);
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

function scrollPanel(panel, interval = 300, pauseFrames = 10) {
    let index = panel.width; // start at the end of the movement

    setInterval(() => {
        for (let row of panel.rows) {
            if (index > panel.width) break;
            let rotatedString =
                row.paddedContent.slice(index) +
                row.paddedContent.slice(0, index);
            updateRow(row, rotatedString);
        }

        index = (index + 1) % (panel.width + pauseFrames);
    }, interval);
}
