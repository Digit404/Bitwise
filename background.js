const bgImage = "https://www.bitwise.live/res/numbers.png";
const backgroundColor = "#111";
const bgWidth = 1307;
const scrollSpeed = 0.5;
const parallaxFactor = 1;
const bgZoom = 80;
const bgOpacity = 0.1;
const vignetteOpacity = 1;

function createBoilerplate() {
    const body = document.body;
    body.style.margin = "0";

    // create elements
    const wrapper = document.createElement("div");
    const bg = document.createElement("div");
    const vignette = document.createElement("div");
    const content = document.createElement("div");

    // set attributes
    wrapper.id = "wrapper";
    bg.id = "bg";
    vignette.id = "vignette";
    content.id = "content";

    // apply styles
    setWrapperStyles(wrapper);
    setBgStyles(bg);
    setVignetteStyles(vignette);
    content.style.position = "relative";

    // copy styles and move children
    while (body.firstChild) {
        content.appendChild(body.firstChild);
    }

    // append elements
    wrapper.append(bg, vignette, content);
    body.appendChild(wrapper);

    copyBodyStyles();
}

function setWrapperStyles(wrapper) {
    wrapper.style.backgroundColor = backgroundColor;
    wrapper.style.position = "relative";
    wrapper.style.width = "100%";
    wrapper.style.minHeight = "100vh";
    wrapper.style.overflow = "hidden";
}

function setBgStyles(bg) {
    bg.style.width = "300%";
    bg.style.backgroundImage = `url(${bgImage})`;
    bg.style.opacity = `${bgOpacity}`;
    bg.style.zoom = `${bgZoom}%`;
    bg.style.position = "absolute";
    bg.style.top = "0";
    bg.style.bottom = "0";
    bg.style.left = "0";
    bg.style.right = "0";
    bg.style.imageRendering = "pixelated"; // chromium + safari
    bg.style.overflow = "hidden";
    bg.style.setProperty("image-rendering", "crisp-edges", "important"); // firefox
}

function setVignetteStyles(vignette) {
    vignette.style.background = "url(https://www.bitwise.live/res/vignette.png) center center fixed";
    vignette.style.opacity = `${vignetteOpacity}`;
    vignette.style.backgroundSize = "100% 100%";
    vignette.style.backgroundPosition = "center";
    vignette.style.position = "absolute";
    vignette.style.top = "0";
    vignette.style.bottom = "0";
    vignette.style.left = "0";
    vignette.style.right = "0";
    vignette.style.pointerEvents = "none";
}

function copyBodyStyles() {
    const bodyStyles = window.getComputedStyle(document.body);
    const content = document.getElementById("content");

    content.style.margin = bodyStyles.margin;
    content.style.padding = bodyStyles.padding;
    content.style.color = bodyStyles.color;
    content.style.fontFamily = bodyStyles.fontFamily;
    content.style.fontSize = bodyStyles.fontSize;
    content.style.lineHeight = bodyStyles.lineHeight;
}

function moveBackground() {
    const bgElement = document.querySelector("#bg");
    let bgPosition = 0;

    function animate() {
        const scrollTop = window.scrollY;
        bgPosition -= scrollSpeed;

        if (bgPosition <= -bgWidth) {
            bgPosition = 0;
        }

        bgElement.style.transform = `translateX(${bgPosition}px) translateY(${scrollTop * parallaxFactor}px)`;

        requestAnimationFrame(animate);
    }

    animate();
}

createBoilerplate();
moveBackground();
