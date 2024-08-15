/* 
    Author: Digit (https://www.rebitwise.com/)
    License: This script is provided for free use and distribution. 
            You are free to copy, modify, and distribute this file without any restrictions.
*/

// Initialize all LCD panels on the page

async function initializeAllPanels() {
    const panels = document.querySelectorAll(".lcd-panel");
    Array.from(panels).map(initializePanel);
    await Promise.all(Array.from(panels).map(animatePanel));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updatePanelProperties(panel) {
    // store panel properties in the panel object
    panel.rows = Array.from(panel.children);
    panel.computedStyle = getComputedStyle(panel);
    panel.width = parseInt(panel.computedStyle.getPropertyValue("--width"));
    panel.height = parseInt(panel.computedStyle.getPropertyValue("--height"));
    panel.textAlign = panel.computedStyle.getPropertyValue("--text-align");
    panel.animation = panel.computedStyle.getPropertyValue("--animation");
    panel.scrollSpeed = parseInt(panel.computedStyle.getPropertyValue("--scroll-speed"));
    panel.pauseTime = parseInt(panel.computedStyle.getPropertyValue("--animation-pause-time"));
    panel.blinkDuration = parseInt(panel.computedStyle.getPropertyValue("--blink-duration"));
    panel.typewriterSpeed = parseInt(panel.computedStyle.getPropertyValue("--typewriter-speed"));
}

function setPanelProperty(panel, property, value) {
    panel.style.setProperty(property, value);
    updatePanelProperties(panel);
}

function initializePanel(panel) {
    // get initial values of panel properties
    updatePanelProperties(panel);

    // adjust panel height if necessary
    if (panel.height < panel.rows.length) {
        panel.style.setProperty("--height", panel.rows.length);
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

    // adjust panel width if necessary
    for (let row of panel.rows) {
        row.initialContent = row.textContent;
        row.length = row.initialContent.length;

        if (row.length > panel.width) {
            panel.style.setProperty("--width", row.length);
        }
    }

    // update panel properties after adjusting width and height
    updatePanelProperties(panel);

    for (let row of panel.rows) {
        // update the row content and add padding
        switch (panel.textAlign) {
            case "center":
                let padding = Math.floor((panel.width - row.length) / 2);
                row.paddedContent = row.initialContent.padStart(padding + row.initialContent.length, " ").padEnd(panel.width, " ");
                break;
            case "right":
                row.paddedContent = row.initialContent.padStart(panel.width, " ");
                break;
            case "left":
            default:
                row.paddedContent = row.initialContent.padEnd(panel.width, " ");
                break;
        }

        updateRow(row, row.paddedContent);
    }
}

function updateRow(row, string) {
    // reuse existing spans
    if (row.children.length !== string.length) {
        row.textContent = ""; // clear row if span count mismatch
        for (let char of string) {
            const span = document.createElement("span");
            span.classList.add("lcd-panel-char");
            span.textContent = char;
            row.appendChild(span);
        }
    } else {
        row.querySelectorAll("span").forEach((span, index) => {
            span.textContent = string[index];
        });
    }
}

async function animatePanel(panel) {
    while (true) {
        updatePanelProperties(panel);

        switch (panel.animation) {
            case "blink":
                await blinkPanel(panel);
                break;
            case "scroll":
                await scrollPanel(panel);
                break;
            case "typewriter":
                await typewriterPanel(panel);
                break;
            default:
                await delay(1000);
                break;
        }
    }
}

async function scrollPanel(panel) {
    for (let i = 0; i <= panel.width; i++) {
        for (let row of panel.rows) {
            let rotatedString = row.paddedContent.slice(i) + row.paddedContent.slice(0, i);
            updateRow(row, rotatedString);
        }
        await delay(panel.scrollSpeed);
    }
    await delay(panel.pauseTime);
}

async function blinkPanel(panel) {
    setPanelProperty(panel, "--text-color", "#0000");
    setPanelProperty(panel, "--text-shadow-color", "#0000");
    await delay(panel.blinkDuration);

    setPanelProperty(panel, "--text-color", "");
    setPanelProperty(panel, "--text-shadow-color", "");
    await delay(panel.pauseTime / 2);
}

async function typewriterPanel(panel) {
    Array.from(panel.rows).map(row => updateRow(row, " ".repeat(panel.width)));
    for (let row of panel.rows) {
        for (let i = 0; i <= row.paddedContent.length; i++) {
            updateRow(row, row.paddedContent.slice(0, i) + " ".repeat(panel.width - i));
            await delay(panel.typewriterSpeed);
        }
    }
    await delay(panel.pauseTime);
}

initializeAllPanels();