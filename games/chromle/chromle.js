const elements = {
    mainTitle: document.getElementById("main-title"),
    bgLeft: document.getElementById("bg-left"),
    bgRight: document.getElementById("bg-right"),
    startScreen: document.getElementById("start-screen"),
    gameScreen: document.getElementById("game-screen"),
    guessButton: document.getElementById("guess-button"),
    diffDisplay: document.getElementById("diff-display"),
    guessInput: document.getElementById("guess-input"),
    guessBox: document.getElementById("guess-box"),
    endScreen: document.getElementById("end-screen"),
    winTitle: document.getElementById("win-title"),
    playAgainButton: document.getElementById("play-again-button"),
    playButton: document.getElementById("play-button"),
};

let guesses = [];
let flashingInterval;

let state = 0;

function getRandomColor() {
    const hex = Math.floor(Math.random() * 16777216)
        .toString(16)
        .padStart(6, "0");
    return "#" + hex;
}

function getRandomHalfColor() {
    const hex = Math.floor(Math.random() * 4096)
        .toString(16)
        .padStart(3, "0");
    const doubledHex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    return "#" + doubledHex;
}

function getRandomHue() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 50%)`;
}

function getRandomHueDeg() {
    return Math.floor(Math.random() * 360);
}

function flashBackground(title, interval) {
    const { bgLeft, bgRight } = elements;
    bgLeft.style.transition = "background-color 3s linear";
    bgRight.style.transition = "background-color 3s linear";
    bgLeft.style.backgroundColor = getRandomHue();
    bgRight.style.backgroundColor = getRandomHue();
    title.style.scale = Math.random() * 0.5 + 1;
    title.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
}

function startFlashingBackground(element) {
    clearInterval(flashingInterval);
    flashingInterval = setInterval(() => flashBackground(element), 3000);
}

// Initial call to start flashing at the beginning
startFlashingBackground(elements.mainTitle);

function colorCodeToValue(color) {
    const hex = color.replace("#", "");
    if (hex.length === 3) {
        return {
            r: parseInt(hex[0] + hex[0], 16),
            g: parseInt(hex[1] + hex[1], 16),
            b: parseInt(hex[2] + hex[2], 16),
        };
    }
    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
    };
}

function compareColors(color1, color2) {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
}

function showCountdown(callback) {
    const numberDisplay = (i) => {
        if (i > 0) {
            const number = document.createElement("div");
            number.textContent = i;
            number.classList.add("countdown");
            document.body.appendChild(number);
            setTimeout(() => {
                number.remove();
                numberDisplay(i - 1);
            }, 800); // not actually a second
        } else {
            const go = document.createElement("div");
            go.textContent = "Go!";
            go.classList.add("countdown");
            document.body.appendChild(go);
            setTimeout(() => go.remove(), 800);
            callback();
        }
    };
    numberDisplay(3);
}

elements.playButton.addEventListener("click", () => {
    const { bgLeft, bgRight, startScreen } = elements;
    bgLeft.style.transition = "background-color 1s linear";
    bgRight.style.transition = "background-color 1s linear";
    clearInterval(flashingInterval);
    bgLeft.style.backgroundColor = "#000";
    bgRight.style.backgroundColor = "#000";
    startScreen.style.display = "none";
    showCountdown(startGame);
});

function startGame() {
    const { diffDisplay, guessInput, bgRight, gameScreen } = elements;
    const hardMode = document.getElementById("hard-mode").checked;
    diffDisplay.textContent = "";
    guessInput.value = "";
    guessInput.maxLength = hardMode ? 6 : 3;
    guessInput.cols = hardMode ? 6 : 3;

    const color = hardMode ? getRandomColor() : getRandomHalfColor();
    const colorValue = colorCodeToValue(color);

    bgRight.style.backgroundColor = color;
    gameScreen.style.display = "flex";

    elements.guessButton.onclick = () => makeGuess(colorValue, color);
}

function makeGuess(colorValue, color) {
    const { diffDisplay, guessButton, guessInput, bgLeft } = elements;
    const guess = guessInput.value;

    // Validation for hex color input
    if (!/^[0-9A-F]{3}([0-9A-F]{3})?$/i.test(guess)) {
        guessButton.textContent = "Invalid";
        guessButton.classList.add("invalid");
        setTimeout(() => {
            guessButton.textContent = "Guess";
            guessButton.classList.remove("invalid");
        }, 1000);
        return;
    }

    bgLeft.style.backgroundColor = `#${guess}`;
    const guessValue = colorCodeToValue(`#${guess}`);
    guesses.push(guessValue);

    if (compareColors(guessValue, colorValue)) {
        win(color);
        return;
    }

    const diff = {
        r: colorValue.r - guessValue.r,
        g: colorValue.g - guessValue.g,
        b: colorValue.b - guessValue.b,
    };

    diffDisplay.textContent = `${diff.r > 0 ? "⬆️" : diff.r < 0 ? "⬇️" : "🟩"} ${diff.g > 0 ? "⬆️" : diff.g < 0 ? "⬇️" : "🟩"} ${diff.b > 0 ? "⬆️" : diff.b < 0 ? "⬇️" : "🟩"}`;
    diffDisplay.hidden = false;
}

function win(color) {
    const { gameScreen, endScreen, winTitle } = elements;
    gameScreen.style.display = "none";
    endScreen.style.display = "flex";
    document.getElementById("score").textContent = `Score: ${guesses.length}`;
    startFlashingBackground(winTitle); // Use the same flashing function for the win screen

    elements.playAgainButton.onclick = () => {
        endScreen.style.display = "none";
        elements.startScreen.style.display = "flex";
        clearInterval(flashingInterval);
        startFlashingBackground(elements.mainTitle);
        guesses.length = 0; // Reset guesses for the new game
    };
}
