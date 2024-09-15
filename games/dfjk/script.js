let keys = ["d", "f", "j", "k"];
let HP = 10;
let length = 50;

const mistakes = document.getElementById("mistakes");
const field = document.getElementById("field");
const seedInput = document.getElementById("seed");

const clickFile = "/res/sound/click.wav";
const errorFile = "/res/sound/error.wav";
const failFile = "/res/sound/fail.wav";
const ultimateFile = "/res/sound/ultimate.wav";
const chordFile = "/res/sound/chord.wav";
const riff = "/res/sound/riff.wav";

let mistakeCount = 0;
let gameOver = false;
let lightMode = false;
let gameStart = false;
let chart;
let startTime;
let secretTicker = 0;

let dfjkContainer;

const settingsButton = document.getElementById("settings-button");
const settingsDialog = document.getElementById("settings-dialog");
const lightModeCheckbox = document.getElementById("light-mode");
const closeButton = document.getElementById("close-button");
const hardModeCheckbox = document.getElementById("hard-mode");
const hardModeLabel = document.querySelector('label[for="hard-mode"]');
const scaleInput = document.getElementById("scale");
const lengthInput = document.getElementById("length");

settingsButton.onclick = () => {
    settingsDialog.showModal();
};

closeButton.onclick = () => {
    closeDialog();
};

function closeDialog() {
    secretTicker = 0;
    settingsDialog.close();
}

window.addEventListener("click", (event) => {
    if (event.target === settingsDialog) {
        closeDialog();
    }
});

lightModeCheckbox.onchange = () => {
    document.body.classList.toggle("light", lightModeCheckbox.checked);
    lightMode = lightModeCheckbox.checked;
};

hardModeCheckbox.onchange = () => {
    if (secretTicker === 5) {
        activateNightmareMode();
        return;
    }

    if (hardModeCheckbox.checked) {
        keys = ["d", "f", "j", "k", "l"];
    } else {
        keys = ["d", "f", "j", "k"];
    }
    secretTicker++;
    initializeGame();
};

scaleInput.addEventListener("input", () => {
    document.documentElement.style.setProperty("--key-height", scaleInput.value + "rem");
});

lengthInput.addEventListener("input", () => {
    if (lengthInput.value === "666") {
        activateNightmareMode();
        return;
    }
    length = lengthInput.value;
    initializeGame();
});

function activateNightmareMode() {
    hardModeLabel.textContent = "NIGHTMARE MODE";
    hardModeLabel.style.color = "var(--fail-color)";
    hardModeLabel.classList.add("fail");
    keys = ["s", "d", "f", "j", "k", "l"];
    lengthInput.value = 75;
    length = 75;
    lengthInput.disabled = true;
    HP = 5;

    playAudio(riff, 1);
    updateMistakes();

    initializeGame();
}

function initializeGame() {
    const existingContainer = document.getElementById("dfjk-container");

    if (existingContainer) {
        existingContainer.remove();
    }

    dfjkContainer = document.createElement("div");
    dfjkContainer.id = "dfjk-container";
    field.insertAdjacentElement("afterend", dfjkContainer);

    document.documentElement.style.setProperty("--letters", keys.length);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const span = document.createElement("span");
        span.textContent = key.toUpperCase();
        span.classList.add(key, "key");
        dfjkContainer.appendChild(span);
    }

    newSeed();

    document.addEventListener("keydown", keydown);

    seedInput.onchange = () => {
        newChart(length);
    };

    mistakes.onclick = () => {
        newSeed();
    };
}

function newChart(length) {
    if (!seedInput.value) seedInput.value = Math.floor(Math.random() * 100000);
    let seed = parseInt(seedInput.value);
    clearChart();

    chart = Array.from({ length }, () => {
        seed = hashCode(seed.toString());
        return selectRandomKey(seed);
    });

    drawChart(chart);
    mistakeCount = 0;
    gameStart = false;
    updateMistakes();

    clearStyles();
    gameOver = false;
}

function clearStyles() {
    dfjkContainer.classList = [];
    document.body.classList = [];
    mistakes.classList = [];
    document.body.classList.toggle("light", lightMode);
}

function newSeed() {
    seedInput.value = Math.floor(Math.random() * 100000);
    newChart(length);
}

function selectRandomKey(seed) {
    const seededRandom = mulberry32(seed)();
    return keys[Math.floor(seededRandom * keys.length)];
}

function drawChart(chart) {
    chart.forEach((key) => {
        const span = document.createElement("span");
        span.textContent = key.toUpperCase();
        span.classList.add(key, "key");
        let offset = keys.indexOf(key) - keys.length / 2;
        span.style.translate = "calc((var(--key-width) + var(--key-gap)) * " + offset + " + (var(--key-width) + var(--key-gap)) / 2)";
        field.appendChild(span);
    });
}

function clearChart() {
    while (field.firstChild) {
        field.removeChild(field.firstChild);
    }
}

function keydown(event) {
    const { key } = event;

    if (key === "r") {
        newChart(length);
    }

    if (key === " ") {
        newSeed();
    }

    if (gameOver) return;

    if (key === chart[0]) {
        closeDialog();

        if (!gameStart) {
            gameStart = true;
            startTime = performance.now();
            mistakes.classList.add("play");
        }

        chart.shift();

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

        field.removeChild(field.children[0]);
        playAudio(clickFile);

        if (chart.length === 0) win();
    } else if (keys.includes(key) && chart.length !== length) {
        mistake();
    }
}

function win() {
    const time = (performance.now() - startTime) / 1000;

    clearStyles();
    if (mistakeCount === 0) {
        playAudio(ultimateFile);
        mistakes.textContent = "PERFECT! Time: " + time.toFixed(2) + "s";
        mistakes.classList.add("perfect");
    } else {
        playAudio(chordFile);
        mistakes.textContent = "Mistakes: " + mistakeCount + " | Time: " + time.toFixed(2) + "s";
        mistakes.classList.add("win");
    }

    dfjkContainer.classList.add("win");
    gameOver = true;
}

function mistake() {
    playAudio(errorFile);
    mistakeCount++;

    mistakes.classList.add("fail");
    document.body.classList.add("fail");

    setTimeout(() => {
        if (!gameOver) {
            mistakes.classList.remove("fail");
            document.body.classList.remove("fail");
        }
    }, 100);

    if (mistakeCount === HP) {
        fail();
    } else {
        updateMistakes();
    }
}

function fail() {
    playAudio(failFile);
    mistakes.textContent = "Fail!";
    document.body.classList.add("fail");
    mistakes.classList.add("fail");
    dfjkContainer.classList.add("fail");
    gameOver = true;
}

function playAudio(src, volume = 0.5) {
    const audio = new Audio(src);
    audio.mozPreservesPitch = false;
    audio.volume = volume;
    audio.play();
}

function updateMistakes() {
    mistakes.textContent = "❤️".repeat(HP - mistakeCount);
}

function mulberry32(a) {
    return function () {
        var t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

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

initializeGame();
