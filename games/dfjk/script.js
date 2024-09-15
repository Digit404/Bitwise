const chord = new Audio("/res/sound/chord.wav");
const keys = ["d", "f", "j", "k"];
const HP = 10;
const length = 50;
let mistakeCount = 0;
let gameOver = false;

const mistakes = document.getElementById("mistakes");
const field = document.getElementById("field");
const seedInput = document.getElementById("seed");
const dfjkContainer = document.getElementById("dfjk-container");

const clickFile = "/res/sound/click.wav";
const errorFile = "/res/sound/error.mp3";
const failFile = "/res/sound/fail-2.wav";
const ultimateFile = "/res/sound/ultimate.wav";

let chart;
let randomSeed;
let startTime;

newChart(length);

document.addEventListener("keydown", keydown);

mistakes.onclick = () => {
    seedInput.value = Math.floor(Math.random() * 100000)
    newChart(length);
}

function newChart(length) {
    if (!seedInput.value) seedInput.value = Math.floor(Math.random() * 100000);
    randomSeed = parseInt(seedInput.value);
    clearChart();
    let currentSeed = randomSeed;

    chart = Array.from({ length }, () => {
        currentSeed = hashCode(currentSeed.toString());
        return selectRandomKey(currentSeed);
    });

    drawChart(chart);
    mistakeCount = 0;
    updateMistakes(HP);

    dfjkContainer.classList = [];
    document.body.classList = [];
    mistakes.classList = [];
    gameOver = false;
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
        seedInput.value = Math.floor(Math.random() * 100000)
        newChart(length);
    }

    if (gameOver) return;

    if (key === chart[0]) {
        if (chart.length === length) {
            startTime = performance.now();
        }

        chart.shift();

        Array.from(field.children).forEach((el, index) => {
            if (index > 0) {
                el.classList.add('falling');
                el.addEventListener('animationend', () => {
                    el.classList.remove('falling');
                }, { once: true });
            }
        });

        field.removeChild(field.children[0]);
        playAudio(clickFile);

        if (chart.length === 0) win();
    } else if (keys.includes(key)) {
        mistake();
    }
}

function win() {
    const time = (performance.now() - startTime) / 1000;
    if (mistakeCount === 0) {
        playAudio(ultimateFile);
        updateMistakes("PERFECT! Time: " + time.toFixed(2) + "s");
        mistakes.classList.add("perfect")
    } else {
        chord.play();
        updateMistakes("Time: " + time.toFixed(2) + "s");
        mistakes.classList.add("win");
    }

    dfjkContainer.classList.add("win");
    gameOver = true;
}

function mistake() {
    playAudio(errorFile);
    mistakeCount++;

    if (mistakeCount === HP) {
        fail();
    } else {
        updateMistakes(HP - mistakeCount);
    }
}

function fail() {
    playAudio(failFile);
    updateMistakes("Fail!");
    document.body.classList.add("fail");
    mistakes.classList.add("fail");
    dfjkContainer.classList.add("fail");
    gameOver = true;
}

function playAudio(src) {
    const audio = new Audio(src);
    audio.mozPreservesPitch = false;
    audio.volume = 0.5;
    audio.play();
}

function updateMistakes(text) {
    mistakes.textContent = text;
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
