// initial game parameters
let keys = ["d", "f", "j", "k"];
let HP = 10;
let length = 50;
let mistakeCount = 0;
let gameOver = false;
let lightMode = false;
let gameStart = false;
let chart;
let startTime;
let secretTicker = 0;
let safePeriod = false;

// DOM elements
const mistakes = document.getElementById("mistakes");
const field = document.getElementById("field");
const seedInput = document.getElementById("seed");

// settings elements
const settingsButton = document.getElementById("settings-button");
const settingsDialog = document.getElementById("settings-dialog");
const lightModeCheckbox = document.getElementById("light-mode");
const hardModeCheckbox = document.getElementById("hard-mode");
const hardModeLabel = document.querySelector('label[for="hard-mode"]');
const scaleInput = document.getElementById("scale");
const lengthInput = document.getElementById("length");
const hpInput = document.getElementById("hp");
const hpIndicator = document.getElementById("hp-indicator");

// results elements
const results = document.getElementById("results");
const starField = document.getElementById("star-field");
const resultTime = document.getElementById("result-time");
const resultAccuracy = document.getElementById("result-accuracy");
const stars = document.querySelectorAll(".star");
const resultTitle = document.getElementById("result-title");
const resultChartNo = document.getElementById("result-chart-no");
const shareButton = document.getElementById("share-button");

let dfjkContainer;

// audio files
const clickFile = "/res/sound/click.wav";
const errorFile = "/res/sound/error.wav";
const failFile = "/res/sound/fail.wav";
const ultimateFile = "/res/sound/ultimate.wav";
const chordFile = "/res/sound/chord.wav";
const riffFile = "/res/sound/riff.wav";
const bellFile = "/res/sound/bell.wav";
const inaccuracyFile = "/res/sound/inaccuracy.wav";

// create an AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// audio buffers
let buffers = {};

// settings dialog event listeners
settingsButton.onclick = () => {
    playAudio(clickFile);
    settingsDialog.showModal();
};

window.addEventListener("click", (event) => {
    if (event.target === settingsDialog) {
        closeSettingsModal();
    }

    if (!results.hidden && !results.contains(event.target) && !safePeriod) {
        results.hidden = true;
        newSeed();
        newChart(length);
    }
});

lightModeCheckbox.onchange = () => {
    playAudio(clickFile);
    document.body.classList.toggle("light", lightModeCheckbox.checked);
};

hardModeCheckbox.onchange = () => {
    playAudio(clickFile);
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

    if (length > 500) {
        length = 500;
        lengthInput.value = 500;
    } else if (length < 10) {
        length = 10;
        lengthInput.value = 10;
    }

    newChart(length);
});

hpInput.addEventListener("input", () => {
    HP = hpInput.value;
    hpIndicator.textContent = HP;
    updateMistakes();
});

// load audio file and buffer it
async function loadAudio(file) {
    const response = await fetch(file);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    buffers[file] = audioBuffer;
}

// initialize all audio files
function initializeAudio() {
    const audioFiles = [clickFile, errorFile, failFile, ultimateFile, chordFile, riffFile, bellFile, inaccuracyFile];
    audioFiles.forEach((file) => loadAudio(file));
}

function closeSettingsModal() {
    // reset secret ticker when dialog is closed
    secretTicker = 0;
    settingsDialog.close();
}

// check for light mode and apply it
function lightModeCheck() {
    const light = window.matchMedia("(prefers-color-scheme: light)").matches;

    if (light) {
        document.body.classList.add("light");
        lightModeCheckbox.checked = true;
    }
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
    hardModeCheckbox.checked = true;
    hardModeCheckbox.disabled = true;
    HP = 5;
    hpInput.value = HP;
    hpIndicator.textContent = HP;
    hpInput.disabled = true;

    // play nightmare mode sound
    playAudio(riffFile, 1);

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
        span.addEventListener("click", () => {
            hitKey(key);
        });
        dfjkContainer.appendChild(span);
    }

    // initialize chart with seed
    const currentURL = new URL(window.location.href);
    const seed = currentURL.searchParams.get("s");
    length = parseInt(currentURL.searchParams.get("l")) || length;

    if (seed) {
        seedInput.innerText = seed;
    } else {
        newSeed();
    }

    newChart(length);

    // add game event listeners
    document.addEventListener("keydown", keydown);

    seedInput.addEventListener("input", () => {
        newChart(length);
    });

    mistakes.onclick = () => {
        newSeed();
        newChart(length);
    };
}

// newChart generates a new chart based on the seed in the input field
function newChart(length) {
    let seed = seedInput.innerText;

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

// clears the mistakes and body of the `win`, `fail`, and `perfect` classes specifically, and does not touch light or nightmare
function clearStyles() {
    // hide the results dialog
    results.hidden = true;

    dfjkContainer.classList = [];
    document.body.classList.remove("fail");
    document.body.classList.remove("win");
    mistakes.classList = [];

    stars.forEach((star) => {
        star.classList.remove("fill");
        star.classList.remove("perfect");
        star.removeEventListener("animationstart", playStarSound);
    });

    resultTitle.classList = [];
    resultTitle.textContent = "Chart Passed!";
}

// newSeed generates a seed
function newSeed() {
    seedInput.innerText = Math.floor(Math.random() * 100000);
}

// pseudo-random key selection based on a seed
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
    if (key === " " && !(event.target === seedInput)) {
        event.preventDefault(); // prevent space from pressing random buttons
        newSeed();
        newChart(length);
    }

    hitKey(key);
}

function hitKey(key) {
    // can't play if the game is over
    if (gameOver) return;

    // check if the key pressed is the correct next key in the chart
    if (key === chart[0]) {
        // close the dialog if it's open
        closeSettingsModal();

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

    // safe period to prevent results from being hidden immediately
    safePeriod = true;
    setTimeout(() => {
        safePeriod = false;
    }, 250);

    results.hidden = false;

    // determine score
    let accuracy = (1 - mistakeCount / (length + mistakeCount)) * 100;

    // calculate stars based on accuracy
    let starCount = 0;

    if (accuracy >= 93.3) {
        starCount = 3;
    } else if (accuracy >= 86.6) {
        starCount = 2;
    } else if (accuracy >= 80) {
        starCount = 1;
    }

    let timeString = time.toFixed(2) + "s";

    resultTime.textContent = timeString;
    resultAccuracy.textContent = "Accuracy: " + accuracy.toFixed(2) + "%";
    resultChartNo.textContent = "#" + seedInput.innerText + " (" + length + ")";

    shareButton.onclick = () => {
        const url = new URL("https://www.rebitwise.com/games/dfjk/");
        url.searchParams.set("s", seedInput.innerText);
        url.searchParams.set("l", length);
        navigator.clipboard.writeText(url.href);
        shareButton.textContent = "check";

        setTimeout(() => {
            shareButton.innerHTML = "share";
        }, 2000);
    };

    // add .fill to each of the stars up to the number of stars
    stars.forEach((star, index) => {
        if (index < starCount) {
            star.classList.add("fill");
            star.addEventListener("animationstart", playStarSound, { once: true });
        }
    });

    // determine the correct win sound based on mistakes
    if (accuracy === 100) {
        playAudio(ultimateFile);
        mistakes.classList.add("perfect");
        mistakes.textContent = "PERFECT!";

        for (let star of stars) {
            star.classList.add("perfect");
        }

        resultTitle.textContent = "PERFECT!";
        resultTitle.classList.add("perfect");
    } else if (accuracy >= 80) {
        playAudio(chordFile);
        mistakes.textContent = "Mistakes: " + mistakeCount;
        mistakes.classList.add("win");
    } else {
        playAudio(inaccuracyFile);
        mistakes.textContent = "Mistakes: " + mistakeCount;
        mistakes.classList.add("win");
    }

    // win styles
    dfjkContainer.classList.add("win");

    gameOver = true;
}

function playStarSound() {
    setTimeout(() => {
        playAudio(bellFile);
    }, 750);
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
    if (mistakeCount >= HP) {
        fail();
    } else {
        updateMistakes();
    }
}

function fail() {
    playAudio(failFile);

    let percentComplete = (1 - chart.length / length) * 100;

    // fail effects
    mistakes.textContent = "Fail! " + percentComplete.toFixed(2) + "%";
    document.body.classList.add("fail");
    mistakes.classList.add("fail");
    dfjkContainer.classList.add("fail");

    gameOver = true;
}

// play buffered audio
function playAudio(file, volume = 0.5) {
    const source = audioContext.createBufferSource();
    source.buffer = buffers[file];
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode).connect(audioContext.destination);
    source.start(0);
}

// update the mistakes display
function updateMistakes() {
    if (HP <= 1) {
        mistakes.textContent = "";
        return;
    }
    mistakes.textContent = "❤️".repeat(HP - mistakeCount) + "🖤".repeat(mistakeCount);
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

// load audio files
initializeAudio();

// check for light mode
lightModeCheck();

// initialize the game
initializeGame();
