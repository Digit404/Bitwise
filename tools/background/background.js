document.addEventListener("DOMContentLoaded", () => {
    // get body element
    const body = document.body;

    // create wrapper and other div elements
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const bg = document.createElement("div");
    bg.className = "bg";

    const vignette = document.createElement("div");
    vignette.className = "vignette";

    const content = document.createElement("div");
    content.className = "content";

    // move existing elements into content and rearrange
    while (body.firstChild) {
        content.appendChild(body.firstChild);
    }

    // append new elements to wrapper
    wrapper.appendChild(bg);
    wrapper.appendChild(vignette);
    wrapper.appendChild(content);

    // append wrapper back to body
    body.appendChild(wrapper);
});

// Cache the background element to avoid multiple DOM queries
var bgElement;
console.log(bgElement);

// Set the initial position of the background
var bgPosition = 0;
// Set the width of the background image
const bgWidth = 1307;

// Function to move the background image
function moveBackground() {
    // Set the scroll speed of the background
    var scrollSpeed = document.getElementById("ScrollSpeed").value / 100;
    // Get the current scroll position of the page
    var scrollTop = window.pageYOffset;
    // Set the parallax factor for the background image
    var parallaxFactor = document.getElementById("parallax").value / 100;

    // Calculate the new background position
    bgPosition -= scrollSpeed;

    // Wrap the background position when it goes beyond the negative width
    if (bgPosition <= -bgWidth) {
        bgPosition = 0;
    }

    // Update the background position using transform for better performance
    bgElement.style.transform = `translateX(${bgPosition}px) translateY(${
        scrollTop * parallaxFactor
    }px)`;

    // Call the function again on the next animation frame
    requestAnimationFrame(moveBackground);
}

// Initial call to start the animation
window.addEventListener("load", function () {
    bgElement = document.querySelectorAll(".bg")[0];
    moveBackground();
});
