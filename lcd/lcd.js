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

function updatePanelProperties(panel) {
    panel.computedStyle = getComputedStyle(panel);
    panel.width = parseInt(panel.computedStyle.getPropertyValue("--width"));
    panel.height = parseInt(panel.computedStyle.getPropertyValue("--height"));
    panel.textAlign = panel.computedStyle.getPropertyValue("--text-align");
    panel.animation = panel.computedStyle.getPropertyValue("--animation");
    panel.scrollInterval = parseInt(panel.computedStyle.getPropertyValue("--scroll-speed")) / panel.width;
    panel.pauseFrames = parseInt(panel.computedStyle.getPropertyValue("--scroll-pause-frames"));
    panel.blinkDuration = parseInt(panel.computedStyle.getPropertyValue("--blink-duration"));
    panel.blinkOnTime = parseInt(panel.computedStyle.getPropertyValue("--blink-on-time"));
}

function initializePanel(panel) {
    // store panel properties in the panel object
    panel.rows = Array.from(panel.children);

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

    animatePanel(panel);
}

function animatePanel(panel) {
    switch (panel.animation) {
        case "blink":
            panel.animationProcess = blinkPanel(panel);
            break;
        case "scroll":
            panel.animationProcess = scrollPanel(panel);
            break;
        default:
            break;
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

function scrollPanel(panel) {
    let index = panel.width; // start at the end of the movement

    const scrollProcess = setInterval(() => {
        if (index <= panel.width) {
            if (panel.animation !== "scroll") { clearInterval(scrollProcess) };
            for (let row of panel.rows) {
                let rotatedString = row.paddedContent.slice(index) + row.paddedContent.slice(0, index);
                updateRow(row, rotatedString);
            }
        } else {
            // get updated panel properties only when animation is stopped and centered
            updatePanelProperties(panel);
        }

        index = (index + 1) % (panel.width + panel.pauseFrames);
    }, panel.scrollInterval);

    return scrollProcess;
}

function blinkPanel(panel) {
    const blinkProcess = setInterval(() => {
        for (let span of panel.querySelectorAll("* > span")) {
            span.style.color = "";

            setTimeout(() => {
                span.style.color = "transparent";
            }, panel.blinkOnTime);
        }
    }, panel.blinkDuration);

    return blinkProcess;
}
