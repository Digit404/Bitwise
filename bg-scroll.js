function createBoilerplate() {
    // get body element
    const body = document.body;

    body.style.margin = "0";

    // create wrapper and other div elements
    const wrapper = document.createElement("div");
    wrapper.id = "wrapper";

    const bg = document.createElement("div");
    bg.id = "bg";

    const vignette = document.createElement("div");
    vignette.id = "vignette";

    const content = document.createElement("div");
    content.id = "content";

    // apply styles to wrapper
    wrapper.style.backgroundColor = "#101010";
    wrapper.style.position = "relative";
    wrapper.style.width = "100%";
    wrapper.style.minHeight = "100vh";
    wrapper.style.overflow = "hidden";

    // apply styles to bg
    bg.style.width = "300%";
    bg.style.backgroundImage = "url(https://www.bitwise.live/res/numbers.png)";
    bg.style.opacity = "0.10";
    bg.style.zoom = "80%";
    bg.style.position = "absolute";
    bg.style.top = "0";
    bg.style.bottom = "0";
    bg.style.left = "0";
    bg.style.right = "0";
    bg.style.imageRendering = "pixelated"; // chromium + safari
    bg.style.overflow = "hidden";

    // apply image-rendering for firefox
    bg.style.setProperty('image-rendering', 'crisp-edges', 'important');

    // apply styles to vignette
    vignette.style.background = "url(https://www.bitwise.live/res/vignette.png) center center fixed";
    vignette.style.opacity = "100";
    vignette.style.backgroundSize = "100% 100%";
    vignette.style.backgroundPosition = "center";
    vignette.style.position = "absolute";
    vignette.style.top = "0";
    vignette.style.bottom = "0";
    vignette.style.left = "0";
    vignette.style.right = "0";
    vignette.style.pointerEvents = "none";

    // apply styles to content
    content.style.position = "relative";
    content.style.textAlign = "center";

    // move existing elements into content
    while (body.firstChild) {
        content.appendChild(body.firstChild);
    }

    // append new elements to wrapper
    wrapper.appendChild(bg);
    wrapper.appendChild(vignette);
    wrapper.appendChild(content);

    // append wrapper to body
    body.appendChild(wrapper);
}

createBoilerplate();

const bgElement = document.querySelector("#bg");

let bgPosition = 0;

const bgWidth = 1307;
const scrollSpeed = 0.5;
const parallaxFactor = 0.1;

// Function to move the background image
function moveBackground() {
    // Get the current scroll position of the page
    const scrollTop = window.scrollY;

    bgPosition -= scrollSpeed;

    if (bgPosition <= -bgWidth) {
        bgPosition = 0;
    }

    // Update the background position
    bgElement.style.transform = `translateX(${bgPosition}px) translateY(${
        scrollTop * parallaxFactor
    }px)`;

    // Call the function again on the next animation frame
    requestAnimationFrame(moveBackground);
}

moveBackground();
