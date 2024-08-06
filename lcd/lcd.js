/* 
    Author: Digit (https://www.bitwise.live/)
    License: This script is provided for free use and distribution. 
            You are free to copy, modify, and distribute this file without any restrictions.
*/

// Initialize all LCD panels on the page

const panels = document.querySelectorAll(".lcd-panel");

for (let panel of panels) {
    initializePanel(panel);
}

function initializePanel(panel) {
    // store panel properties in the panel object
    panel.rows = Array.from(panel.children);
    panel.computedStyle = getComputedStyle(panel);
    panel.width = parseInt(panel.computedStyle.getPropertyValue("--width"));
    panel.height = parseInt(panel.computedStyle.getPropertyValue("--height"));
    panel.centered =
        panel.computedStyle.getPropertyValue("--centered") === "true";
    panel.scroll =
        panel.computedStyle.getPropertyValue("--scrolling") === "true";
    panel.scrollSpeed = parseInt(
        panel.computedStyle.getPropertyValue("--scroll-speed")
    );
    panel.pauseFrames = parseInt(
        panel.computedStyle.getPropertyValue("--scroll-pause-frames")
    );

    // adjust panel height if necessary
    if (panel.height < panel.rows.length) {
        panel.style.setProperty("--height", panel.rows.length);
        panel.height = panel.rows.length;
    } else if (panel.height > panel.rows.length) {
        // create additional rows if necessary
        const fragment = document.createDocumentFragment();
        for (let i = panel.rows.length; i < panel.height; i++) {
            const row = document.createElement("li");
            row.textContent = " ".repeat(panel.width);
            fragment.appendChild(row);
        }
        panel.appendChild(fragment);
        panel.rows = Array.from(panel.children);
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
            row.paddedContent = initialContent
                .padStart(padding + initialContent.length, " ")
                .padEnd(panel.width, " ");
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
        if (index <= panel.width) {
            if (!panel.scroll) return;
            for (let row of panel.rows) {
                let rotatedString =
                    row.paddedContent.slice(index) +
                    row.paddedContent.slice(0, index);
                updateRow(row, rotatedString);
            }
        } else {
            panel.scroll =
                panel.computedStyle.getPropertyValue("--scrolling") === "true";
        }

        index = (index + 1) % (panel.width + pauseFrames);
    }, interval);
}
