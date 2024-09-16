// initial game parameters
let keys = ["d", "f", "j", "k"];
let HP = 10;
let length = 50;

// DOM elements
const mistakes = document.getElementById("mistakes");
const field = document.getElementById("field");
const seedInput = document.getElementById("seed");

// DOM elements for settings
const settingsButton = document.getElementById("settings-button");
const settingsDialog = document.getElementById("settings-dialog");
const lightModeCheckbox = document.getElementById("light-mode");
const hardModeCheckbox = document.getElementById("hard-mode");
const hardModeLabel = document.querySelector('label[for="hard-mode"]');
const scaleInput = document.getElementById("scale");
const lengthInput = document.getElementById("length");

let dfjkContainer;

// audio files
const clickFile = "/res/sound/click.wav";
const errorFile = "/res/sound/error.wav";
const failFile = "/res/sound/fail.wav";
const ultimateFile = "/res/sound/ultimate.wav";
const chordFile = "/res/sound/chord.wav";
const riff = "/res/sound/riff.wav";

// game variables
let mistakeCount = 0;
let gameOver = false;
let lightMode = false;
let gameStart = false;
let chart;
let startTime;
let secretTicker = 0;

// settings dialog event listeners
settingsButton.onclick = () => {
    settingsDialog.showModal();
};

window.addEventListener("click", (event) => {
    if (event.target === settingsDialog) {
        closeDialog();
    }
});

lightModeCheckbox.onchange = () => {
    document.body.classList.toggle("light", lightModeCheckbox.checked);
};

hardModeCheckbox.onchange = () => {
    // click 5 times to activate nightmare mode
    if (secretTicker === 5) {
        activateNightmareMode();
        return;
    }

    secretTicker++;

    if (hardModeCheckbox.checked) {
        keys = ["d", "f", "j", "k", "l"];
    } else {
        keys = ["d", "f", "j", "k"];
    }

    initializeGame();
};

scaleInput.addEventListener("input", () => {
    document.documentElement.style.setProperty("--key-height", scaleInput.value + "rem");
});

lengthInput.addEventListener("input", () => {
    // secret code to activate nightmare mode
    if (lengthInput.value === "666") {
        activateNightmareMode();
        return;
    }
    length = lengthInput.value;
    newChart(length);
});

function closeDialog() {
    // reset secret ticker when dialog is closed
    secretTicker = 0;
    settingsDialog.close();
}

function activateNightmareMode() {
    // nightmare mode styles
    hardModeLabel.textContent = "NIGHTMARE MODE";
    hardModeLabel.style.color = "var(--fail-color)";
    hardModeLabel.classList.add("fail");
    document.body.classList.add("nightmare");
    document.body.classList.remove("light");

    // nightmare mode adds 2 extra keys to standard mode, makes length 75 and halves health
    keys = ["s", "d", "f", "j", "k", "l"];
    lengthInput.value = 75;
    length = 75;
    lengthInput.disabled = true;
    lightModeCheckbox.checked = false;
    lightModeCheckbox.disabled = true;
    HP = HP / 2;

    // play nightmare mode sound
    playAudio(riff, 1);

    updateMistakes();
    initializeGame();
}

function initializeGame() {
    // remove existing key container and create a new one
    const existingContainer = document.getElementById("dfjk-container");

    if (existingContainer) {
        existingContainer.remove();
    }

    dfjkContainer = document.createElement("div");
    dfjkContainer.id = "dfjk-container";
    field.insertAdjacentElement("afterend", dfjkContainer); // place right after the field

    // update css vars based on key count
    document.documentElement.style.setProperty("--letters", keys.length);

    // create key elements
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const span = document.createElement("span");
        span.textContent = key.toUpperCase();
        span.classList.add(key, "key");
        dfjkContainer.appendChild(span);
    }

    // initialize chart with random seed
    newSeed();
    newChart(length);

    // add game event listeners
    document.addEventListener("keydown", keydown);

    seedInput.onchange = () => {
        newChart(length);
    };

    mistakes.onclick = () => {
        newSeed();
        newChart(length);
    };
}

// newChart generates a new chart based on the seed in the input field
function newChart(length) {
    // if seed is empty, generate a random seed; this will only happen if user deletes the seed
    if (!seedInput.value) newSeed();
    let seed = parseInt(seedInput.value);

    // clear and generate the chart
    clearChart();

    chart = Array.from({ length }, () => {
        seed = hashCode(seed.toString());
        return selectRandomKey(seed);
    });

    // populate the field with the chart
    chart.forEach((key) => {
        const span = document.createElement("span");
        span.textContent = key.toUpperCase();
        span.classList.add(key, "key");

        // calculate the offset based on the key
        let offset = keys.indexOf(key) - keys.length / 2;
        span.style.translate = "calc((var(--key-width) + var(--key-gap)) * " + offset + " + (var(--key-width) + var(--key-gap)) / 2)";

        field.appendChild(span);
    });

    // reset mistakes
    mistakeCount = 0;
    updateMistakes();

    clearStyles();

    gameStart = false;
    gameOver = false;
}

// clears the mistakes and body of the `win` and `fail` classes specifically, and does not touch light or nightmare
function clearStyles() {
    dfjkContainer.classList = [];
    document.body.classList.remove("fail");
    document.body.classList.remove("win");
    mistakes.classList = [];
}

// newSeed generates a seed
function newSeed() {
    seedInput.value = Math.floor(Math.random() * 100000);
}

// psuedo-random key selection based on a seed
function selectRandomKey(seed) {
    const seededRandom = mulberry32(seed)();
    return keys[Math.floor(seededRandom * keys.length)];
}

// remove all children from the field
function clearChart() {
    while (field.firstChild) {
        field.removeChild(field.firstChild);
    }
}

// most of the game logic is in this function
function keydown(event) {
    const { key } = event;

    // restart the game with the same seed
    if (key === "r") {
        newChart(length);
    }

    // generate a new chart with a new seed
    if (key === " ") {
        event.preventDefault(); // prevent space from pressing random buttons
        newSeed();
        newChart(length);
    }

    // can't play if the game is over
    if (gameOver) return;

    // check if the key pressed is the correct next key in the chart
    if (key === chart[0]) {
        // close the dialog if it's open
        closeDialog();

        // start the timer if it's the first key
        if (!gameStart) {
            gameStart = true;
            startTime = performance.now();
            mistakes.classList.add("play");
        }

        // remove the pressed key from the internal chart
        chart.shift();

        // animate the key falling; not sure how this works so convincingly
        Array.from(field.children).forEach((el, index) => {
            if (index > 0) {
                el.classList.add("falling");
                el.addEventListener(
                    "animationend",
                    () => {
                        el.classList.remove("falling");
                    },
                    { once: true }
                );
            }
        });

        // remove the key from the field
        field.removeChild(field.children[0]);
        playAudio(clickFile);

        // if there's no more keys, win
        if (chart.length === 0) win();
        // if it's wrong, mistake, unless the game hasn't started yet
    } else if (keys.includes(key) && gameStart) {
        mistake();
    }
}

function win() {
    // record time
    const time = (performance.now() - startTime) / 1000;

    clearStyles();

    // determine the correct win sound based on mistakes
    if (mistakeCount === 0) {
        playAudio(ultimateFile);
        mistakes.textContent = "PERFECT! Time: " + time.toFixed(2) + "s";
        mistakes.classList.add("perfect");
    } else {
        playAudio(chordFile);
        mistakes.textContent = "Mistakes: " + mistakeCount + " | Time: " + time.toFixed(2) + "s";
        mistakes.classList.add("win");
    }

    // win styles
    dfjkContainer.classList.add("win");

    gameOver = true;
}

function mistake() {
    playAudio(errorFile);
    mistakeCount++;

    // mistake styles
    mistakes.classList.add("fail");
    document.body.classList.add("fail");

    // remove the styles after a short delay, but only if the game isn't over
    setTimeout(() => {
        if (!gameOver) {
            mistakes.classList.remove("fail");
            document.body.classList.remove("fail");
        }
    }, 100);

    // fail condition
    if (mistakeCount === HP) {
        fail();
    } else {
        updateMistakes();
    }
}

function fail() {
    playAudio(failFile);

    // fail effects
    mistakes.textContent = "Fail!";
    document.body.classList.add("fail");
    mistakes.classList.add("fail");
    dfjkContainer.classList.add("fail");

    gameOver = true;
}

// create and play audio
function playAudio(src, volume = 0.5) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play();
}

// update the mistakes display
function updateMistakes() {
    mistakes.textContent = "❤️".repeat(HP - mistakeCount);
}

// PRNG from https://stackoverflow.com/a/47593316
function mulberry32(a) {
    return function () {
        var t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// hash function from https://stackoverflow.com/a/7616484
function hashCode(str) {
    var hash = 0,
        i,
        chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}

// initialize the game
initializeGame();
