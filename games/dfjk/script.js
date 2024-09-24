// initial game parameters
let HP = 10;
let length = 50;
let mistakeCount = 0;
let gameOver = false;
let lightMode = false;
let gameStart = false;
let nightmare = false;
let chart;
let startTime;
let secretTicker = 0;
let safePeriod = false;
let immortal = false;
let inChord = false;
let mode = "normal";

// DOM elements
const statusBar = document.getElementById("status-bar");
const field = document.getElementById("field");
const seedInput = document.getElementById("seed");
const helpIcon = document.getElementById("help-icon");
const helpDialog = document.getElementById("help-dialog");

// settings elements
const settingsButton = document.getElementById("settings-button");
const settingsDialog = document.getElementById("settings-dialog");
const lightModeCheckbox = document.getElementById("light-mode");
const extraKeyCheckbox = document.getElementById("extra-key");
const scaleInput = document.getElementById("scale");
const lengthInput = document.getElementById("length");
const hpInput = document.getElementById("hp");
const hpIndicator = document.getElementById("hp-indicator");
const keyInput = document.getElementById("key-input");
const modeSelect = document.getElementById("mode-select");

// results elements
const results = document.getElementById("results");
const starField = document.getElementById("star-field");
const resultTime = document.getElementById("result-time");
const resultAccuracy = document.getElementById("result-accuracy");
const stars = document.querySelectorAll(".star");
const resultTitle = document.getElementById("result-title");
const resultChartNo = document.getElementById("result-chart-no");
const shareButton = document.getElementById("share-button");
const resultCPS = document.getElementById("result-cps");

// globals
let dfjkContainer;
let sounds;

const inputFields = [seedInput, keyInput];
const originalKeys = ["d", "f", "j", "k"];

class Key {
    static container;
    static keys = [];

    constructor(key) {
        this.key = key;
        this.pressed = false;

        Key.keys.push(this);
    }

    build() {
        this.button = document.createElement("span");
        this.button.textContent = this.key.toUpperCase();
        this.button.classList.add(this.key, "key");
        this.button.addEventListener("click", () => {
            safePeriod = true;
            this.hit();
        });

        // needs to append first so it's "real" and styles can be computed
        Key.container.appendChild(this.button);

        // if uncolored, color the key
        const computedStyle = window.getComputedStyle(this.button);
        if (computedStyle.backgroundColor === "rgb(255, 255, 255)") {
            this.color = randomHue(this.key);
            this.button.style.backgroundColor = this.color;
        }

        return this.button;
    }

    hit(silent = false) {
        // can't play if the game is over
        if (gameOver) return;

        this.pressed = true;

        const beat = chart[0];
        const beatElement = field.children[0];

        // check for mistakes
        if (!beat.includes(this.key)) {
            if (gameStart) mistake();
            return;
        }

        // close the dialog if it's open
        closeSettingsModal();

        // start the timer if it's the first key
        if (!gameStart) {
            gameStart = true;
            startTime = performance.now();
            document.body.classList.add("play");
        }

        if (!silent) sounds.click.play();

        if (beat.length > 1) {
            // mark the key as pressed
            const keyElement = beatElement.querySelector(`.${this.key}`);
            keyElement.classList.add("pressed");

            inChord = true;

            // check if all keys in the chord have been pressed
            const allPressed = beat.every((key) => Key.getKey(key).pressed);

            if (!allPressed) {
                return;
            }

            if (!silent) sounds.ping.play(0.25);

            inChord = false;
        }

        // remove the beat from the internal chart
        chart.shift();

        animateKeysFalling();

        // remove the beat from the field
        field.removeChild(beatElement);

        // check if the game is won
        if (chart.length === 0) {
            win();
        }
    }

    static hit(key) {
        let keyObject = Key.getKey(key);

        if (keyObject) {
            keyObject.hit();
        }
    }

    static hitAll() {
        const beat = chart[0];

        if (beat && beat.length === Key.keys.length) {
            for (let key of Key.keys) {
                key.hit(true);
            }
            for (let key of Key.keys) {
                key.pressed = false;
            }
            sounds.ping.play(0.25);
            sounds.click.play();
        } else if (gameOver) {
            initializeGame();
        } else if (gameStart) {
            mistake();
        }
    }

    static press(key) {
        let keyObject = Key.getKey(key);

        if (keyObject) {
            keyObject.pressed = true;
        }
    }

    static release(key) {
        let keyObject = Key.getKey(key);

        if (keyObject) {
            keyObject.pressed = false;
        }
    }

    static buildContainer() {
        if (Key.container) {
            Key.container.remove();
        }

        Key.container = document.createElement("div");
        Key.container.id = "dfjk-container";
        field.insertAdjacentElement("afterend", Key.container); // place right after the field

        // update css vars based on key count
        document.documentElement.style.setProperty("--letters", Key.keys.length);

        for (let key of Key.keys) {
            key.build();
        }
    }

    static set Keys(keys) {
        Key.keys = keys.map((key) => new Key(key));
        Key.buildContainer();
    }

    static get Keys() {
        return Key.keys.map((key) => key.key);
    }

    static getKey(key) {
        return Key.keys.find((k) => k.key === key);
    }
}

class Sound {
    static context = new (window.AudioContext || window.webkitAudioContext)();

    constructor(source, pitch) {
        this.source = source;
        this.pitch = pitch;
        this.buffer = null;
    }

    static async init(source, pitch = 1) {
        const sound = new Sound(source, pitch);
        await sound.loadAudio();
        return sound;
    }

    async loadAudio() {
        const response = await fetch(this.source);
        const arrayBuffer = await response.arrayBuffer();
        this.buffer = await Sound.context.decodeAudioData(arrayBuffer);
    }

    play(volume = 0.5, pitch = this.pitch) {
        const source = Sound.context.createBufferSource();
        source.buffer = this.buffer;
        const gainNode = Sound.context.createGain();
        gainNode.gain.value = volume;
        source.playbackRate.value = pitch;
        source.connect(gainNode).connect(Sound.context.destination);
        source.start(0);
    }
}

async function initializeAudio() {
    sounds = {
        click: await Sound.init("/res/sound/click.wav"),
        error: await Sound.init("/res/sound/error.wav"),
        fail: await Sound.init("/res/sound/fail.wav"),
        ultimate: await Sound.init("/res/sound/ultimate.wav"),
        win: await Sound.init("/res/sound/win.wav"),
        riff: await Sound.init("/res/sound/riff.wav"),
        bell: await Sound.init("/res/sound/bell.wav"),
        inaccuracy: await Sound.init("/res/sound/inaccuracy.wav"),
        ping: await Sound.init("/res/sound/ping.wav", 2),
    };
}

// settings dialog event listeners
settingsButton.onclick = () => {
    sounds.click.play();

    if (gameStart) {
        hpInput.disabled = true;
        lengthInput.disabled = true;
    } else {
        hpInput.disabled = false;
        lengthInput.disabled = false;
    }

    settingsDialog.hidden = !settingsDialog.hidden;
    safePeriod = true;
};

window.addEventListener("click", (event) => {
    // because the click event fires before anything else, we need to prevent the dialogs from closing immediately
    if (safePeriod) {
        safePeriod = false;
        return;
    }

    if (!settingsDialog.hidden && !settingsDialog.contains(event.target)) {
        closeSettingsModal();
    }

    if (!results.hidden && !results.contains(event.target)) {
        results.hidden = true;
        newSeed();
        newChart(length);
    }
});

lightModeCheckbox.onchange = () => {
    sounds.click.play();
    document.body.classList.toggle("light", lightModeCheckbox.checked);
};

extraKeyCheckbox.onchange = () => {
    sounds.click.play();

    if (extraKeyCheckbox.checked) {
        Key.Keys = ["d", "f", "j", "k", "l"];
    } else {
        Key.Keys = ["d", "f", "j", "k"];
    }

    newChart(length);
    updateKeyInput();
};

modeSelect.onchange = () => {
    sounds.click.play();
    mode = modeSelect.value;

    // click 5 times to activate nightmare mode
    if (secretTicker === 5) {
        activateNightmareMode();
        return;
    }

    secretTicker++;

    switch (mode) {
        case "normal":
            modeSelect.style.color = "var(--fg)";
            break;
        case "advanced":
            modeSelect.style.color = "var(--yellow)";
            break;
        case "no-jacks":
            modeSelect.style.color = "var(--green)";
            break;
    }

    newChart(length);
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
    } else if (length < 10) {
        length = 10;
    }

    newChart(length);
});

hpInput.addEventListener("input", () => {
    const hpValue = parseInt(hpInput.value);

    if (hpValue === 16) {
        immortal = true;
        HP = 16;
        hpIndicator.textContent = "∞";
    } else {
        HP = hpValue;
        immortal = false;
        hpIndicator.textContent = HP;
    }

    updateMistakes();
});

keyInput.addEventListener("input", () => {
    if (nightmare) {
        keyInput.innerText = "sdfjkl";
        return;
    }

    let selectedKeys = keyInput.innerText
        .toLowerCase()
        .split("")
        .filter((key) => key !== " ");

    if (selectedKeys.length < 2) {
        selectedKeys = ["d", "f", "j", "k"];
    }

    Key.Keys = [...new Set(selectedKeys)];

    Key.buildContainer();
    newChart(length);
});

keyInput.addEventListener("blur", () => {
    updateKeyInput();
    if (Key.keys.length === 5) {
        extraKeyCheckbox.checked = true;
    } else {
        extraKeyCheckbox.checked = false;
    }
});

helpIcon.addEventListener("mouseover", () => {
    helpDialog.style.opacity = 1;
    helpDialog.style.pointerEvents = "all";
});

helpIcon.addEventListener("mouseout", () => {
    helpDialog.style.opacity = 0;
    helpDialog.style.pointerEvents = "none";
});

function updateKeyInput() {
    keyInput.innerText = Key.Keys.join("").toUpperCase();
}

function closeSettingsModal() {
    // reset secret ticker when dialog is closed
    secretTicker = 0;
    settingsDialog.hidden = true;
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
    modeSelect.classList.add("fail");
    modeSelect.style.color = "var(--red)";
    document.body.classList.add("nightmare");
    document.body.classList.remove("light");

    // nightmare mode adds 2 extra keys to standard mode, makes length 75 and halves health
    lengthInput.value = 75;
    length = 75;
    lengthInput.disabled = true;
    lightModeCheckbox.checked = false;
    lightModeCheckbox.disabled = true;
    extraKeyCheckbox.checked = true;
    extraKeyCheckbox.disabled = true;
    modeSelect.value = "advanced";
    modeSelect.querySelector("option[value='advanced']").innerHTML = "NIGHTMARE";
    modeSelect.disabled = true;
    mode = "advanced";
    HP = 5;
    hpInput.value = HP;
    hpIndicator.textContent = HP;
    hpInput.disabled = true;

    nightmare = true;

    // play nightmare mode sound
    sounds.riff.play(1);

    updateMistakes();
    Key.Keys = ["s", "d", "f", "j", "k", "l"];
    newChart(length);
    updateKeyInput();
}

function initializeGame() {
    Key.Keys = originalKeys;

    // initialize chart with seed
    const currentURL = new URL(window.location.href);
    const seed = currentURL.searchParams.get("s");
    length = parseInt(currentURL.searchParams.get("l")) || length;
    mode = currentURL.searchParams.get("m") || mode;

    if (seed) {
        seedInput.innerText = seed;
    } else {
        newSeed();
    }

    newChart(length);

    // add game event listeners
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);

    seedInput.addEventListener("input", () => {
        newChart(length);
    });

    statusBar.onclick = () => {
        newSeed();
        newChart(length);
    };
}

// newChart generates a new chart based on the seed in the input field
function newChart(length) {
    let seed = seedInput.innerText;

    const rng = new SeedRandom(seed);

    // clear and generate the chart
    while (field.firstChild) {
        field.removeChild(field.firstChild);
    }

    chart = [];

    for (let i = 0; i < length; i++) {
        beat = [];

        let newKey = rng.choice(Key.keys).key;

        if (mode === "no-jacks") {
            // don't allow the same key twice in a row
            while (chart.length > 0 && chart[chart.length - 1].includes(newKey)) {
                newKey = rng.choice(Key.keys).key;
            }
        }

        beat.push(newKey);

        // 10% chance of a chord on advanced mod
        if ((rng.chance(0.1) && mode === "advanced") || (nightmare && rng.chance(0.2))) {
            extraKeys = rng.randInt(1, Key.keys.length);
            for (let j = 0; j < extraKeys; j++) {
                let remainingKeys = Key.keys.filter((key) => !beat.includes(key.key)).map((key) => key.key);
                beat.push(rng.choice(remainingKeys));
            }
        }

        chart.push(beat);
    }

    chart.forEach((beat) => {
        const beatElement = document.createElement("div");
        beatElement.classList.add("beat");

        if (beat.length > 1) {
            beatElement.classList.add("chord");

            if (beat.length === Key.keys.length) {
                beatElement.classList.add("full");
            }
        }

        field.appendChild(beatElement);

        beat.forEach((key) => {
            const span = document.createElement("span");
            span.textContent = key.toUpperCase();
            span.classList.add(key, "key");

            // calculate the offset based on the key
            let xOffset = Key.keys.indexOf(Key.getKey(key)) - Key.keys.length / 2;
            span.style.setProperty("--x-offset", xOffset);

            beatElement.appendChild(span);

            const computedStyle = window.getComputedStyle(span);
            if (computedStyle.backgroundColor === "rgb(255, 255, 255)") {
                const color = randomHue(key);
                span.style.setProperty("--color", color);
                span.style.backgroundColor = color;
            }
        });
    });

    // reset game
    mistakeCount = 0;
    updateMistakes();

    clearStyles();

    gameStart = false;
    gameOver = false;
}

function clearStyles() {
    // hide the results dialog
    results.hidden = true;

    // remove the win, fail, perfect, and play classes
    let classesToRemove = ["win", "fail", "perfect", "play"];

    for (let className of classesToRemove) {
        document.body.classList.remove(className);
    }

    // stop the star sound from playing next time it appears
    stars.forEach((star) => {
        star.removeEventListener("animationstart", playStarSound);
    });
}

// newSeed generates a seed
function newSeed() {
    seedInput.innerText = Math.floor(Math.random() * 100000);
}

// most of the game logic is in this function
function keydown(event) {
    const { key, code } = event;

    // if currently typing, return
    if (inputFields.includes(event.target)) {
        return;
    }

    const keyObject = Key.getKey(key.toLowerCase());

    if (keyObject) {
        // prevent bounce
        if (keyObject.pressed) return;

        keyObject.hit();
        return;
    } else if (key === " " && mode === "advanced") {
        Key.hitAll();
        return;
    }

    if (code === "Escape") {
        closeSettingsModal();
    }

    // restart the game with the same seed
    if (code === "KeyR") {
        newChart(length);
    }

    // generate a new chart with a new seed (space only when game is over on advanced mode, enter whenever)
    if ((code === "Space" && (gameOver || mode !== "advanced")) || code === "Enter") {
        event.preventDefault(); // prevent space from pressing random buttons
        newSeed();
        newChart(length);
    }
}

function keyup(event) {
    const { key } = event;

    Key.release(key);

    if (inChord) {
        const beat = chart[0];
        const beatElement = field.children[0];

        const keyElement = beatElement.querySelector(`.${key}`);
        if (keyElement) {
            keyElement.classList.remove("pressed");
        }

        if (beat.includes(key) && nightmare) {
            mistake();
        }
    }
}

function animateKeysFalling() {
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
}

function win() {
    // record time
    const time = (performance.now() - startTime) / 1000;

    clearStyles();

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

    const timeString = time.toFixed(2) + "s";
    const modeString = nightmare ? "N" : mode === "advanced" ? "A" : mode === "no-jacks" ? "E" : "";

    // keystring is the keys active in the current chart
    const keyString = Key.Keys.join("").toUpperCase();

    resultTime.textContent = timeString;
    resultAccuracy.textContent = "Accuracy: " + accuracy.toFixed(2) + "%";
    resultChartNo.textContent = `${keyString} #${seedInput.innerText} ${modeString}(${length})`;

    const cps = length / time;
    resultCPS.textContent = cps.toFixed(2) + " CPS";

    shareButton.onclick = () => {
        const url = new URL("https://www.rebitwise.com/games/dfjk/");
        url.searchParams.set("s", seedInput.innerText);
        url.searchParams.set("l", length);
        url.searchParams.set("m", mode);
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
        } else {
            star.classList.remove("fill");
        }
    });

    resultTitle.textContent = "Chart Passed!";

    // determine the correct win sound based on mistakes
    if (accuracy === 100) {
        sounds.ultimate.play();
        document.body.classList.add("perfect");
        statusBar.textContent = "PERFECT!";
        resultTitle.textContent = "PERFECT!";
    } else if (accuracy >= 80) {
        sounds.win.play();
        statusBar.textContent = "Mistakes: " + mistakeCount;
    } else {
        sounds.inaccuracy.play();
        statusBar.textContent = "Mistakes: " + mistakeCount;
    }

    // win styles
    document.body.classList.add("win");

    gameOver = true;
}

function playStarSound() {
    setTimeout(() => {
        sounds.bell.play();
    }, 750);
}

function mistake() {
    sounds.error.play();
    mistakeCount++;

    // mistake styles
    document.body.classList.add("fail");

    // remove the styles after a short delay, but only if the game isn't over
    setTimeout(() => {
        if (!gameOver) {
            document.body.classList.remove("fail");
        }
    }, 100);

    // fail condition
    if (mistakeCount >= HP && !immortal) {
        fail();
    } else {
        updateMistakes();
    }
}

function fail() {
    sounds.fail.play();

    let percentComplete = (1 - chart.length / length) * 100;

    // fail effects
    statusBar.textContent = "Fail! " + percentComplete.toFixed(2) + "%";
    document.body.classList.add("fail");

    gameOver = true;
}

// update the mistakes display
function updateMistakes() {
    if (HP <= 1 || (immortal && HP === 16)) {
        statusBar.textContent = "";
        document.body.classList.add("hidden");
        return;
    }
    document.body.classList.remove("hidden");
    statusBar.textContent = "❤️".repeat(HP - mistakeCount) + "🖤".repeat(mistakeCount);
}

function randomHue(seed = Math.random(), blanchFactor = 13) {
    const seededRandom = new SeedRandom(seed).next();
    const randomHue = Math.floor(seededRandom * 360);

    const lightness = 50 + blanchFactor;

    return `hsl(${randomHue}, 100%, ${lightness}%)`;
}

class SeedRandom {
    constructor(seed) {
        this.seed = this.hash(seed.toString());
        this.generator = this.mulberry32(this.seed);
    }

    // hash function from https://stackoverflow.com/a/7616484
    hash(str) {
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

    // PRNG from https://stackoverflow.com/a/47593316
    mulberry32(a) {
        return function () {
            var t = (a += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    next() {
        return this.generator();
    }

    // generator function to be used as an iterator
    *sRandom() {
        while (true) {
            yield this.next();
        }
    }

    reset(seed) {
        this.seed = this.hash(seed.toString());
        this.generator = this.mulberry32(this.seed);
    }

    randFloat(min = 0, max = 1) {
        return this.next() * (max - min) + min;
    }

    randInt(min, max) {
        return Math.floor(this.randFloat(min, max));
    }

    chance(weight = 0.5) {
        return this.next() <= weight;
    }

    choice(arr) {
        return arr[this.randInt(0, arr.length)];
    }
}

// initialize audio
initializeAudio();

// check for light mode
lightModeCheck();

// initialize the game
initializeGame();
